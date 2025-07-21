'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AlertTriangle, Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { Alert, Button, Modal, Badge } from 'react-bootstrap';

interface ChangeTabPreventionProps {
  children: React.ReactNode;
  onAutoSubmit?: () => void;
  enabled?: boolean;
}

const ChangeTabPrevention: React.FC<ChangeTabPreventionProps> = ({ 
  children, 
  onAutoSubmit,
  enabled = true
}) => {
  const [countdown, setCountdown] = useState(10);
  const [showWarning, setShowWarning] = useState(false);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>('default');
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [notificationDenied, setNotificationDenied] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const [isSecureContext, setIsSecureContext] = useState(false);
  const [notificationSupported, setNotificationSupported] = useState(false);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);
  const notificationRef = useRef<Notification | null>(null);
  const originalTitle = useRef<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      originalTitle.current = document.title;
      setIsSecureContext(window.isSecureContext);
      setNotificationSupported('Notification' in window);
      
      if ('Notification' in window) {
        setNotificationPermission(Notification.permission);
        addDebugInfo(`Initial permission: ${Notification.permission}`);
        addDebugInfo(`Secure context: ${window.isSecureContext}`);
        addDebugInfo(`Max actions: ${Notification.maxActions || 'Unknown'}`);
      } else {
        addDebugInfo('Notifications not supported in this browser');
      }
    }
  }, []);

  const addDebugInfo = (info: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `[${timestamp}] ${info}`]);
  };

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const createBeepSound = () => {
      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
      } catch (error) {
        addDebugInfo(`Audio error: ${error}`);
      }
    };

    const sendNotification = (message: string, countdown: number) => {
      if (!('Notification' in window)) {
        addDebugInfo('Notification API not supported');
        return;
      }

      if (Notification.permission !== 'granted') {
        addDebugInfo(`Permission not granted: ${Notification.permission}`);
        return;
      }

      try {
        if (notificationRef.current) {
          notificationRef.current.close();
          addDebugInfo('Closed previous notification');
        }
        
        const options = {
          body: message,
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNEQzI2MjYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+Cjxwb2x5Z29uIHBvaW50cz0iNy44NiAxMiAxNiAyLjkzIDE2IDIxLjA3IDcuODYgMTIiLz4KPC9zdmc+Cjwvc3ZnPgo=',
          badge: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiNEQzI2MjYiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+Cjxwb2x5Z29uIHBvaW50cz0iNy44NiAxMiAxNiAyLjkzIDE2IDIxLjA3IDcuODYgMTIiLz4KPC9zdmc+Cjwvc3ZnPgo=',
          requireInteraction: true,
          tag: `exam-warning-${Date.now()}`,
          renotify: true,
          silent: false,
          timestamp: Date.now(),
          data: {
            countdown: countdown,
            timestamp: Date.now(),
            type: 'exam-warning'
          }
        };

        // Add vibration only if supported (mobile devices)
        if ('vibrate' in navigator) {
          (options as any).vibrate = [200, 100, 200, 100, 200];
        }

        const title = `🚨 UJIAN BERAKHIR DALAM ${countdown} DETIK!`;
        
        addDebugInfo(`Creating notification: ${title}`);
        notificationRef.current = new Notification(title, options);
        
        notificationRef.current.onshow = () => {
          addDebugInfo('✅ Notification shown successfully!');
        };

        notificationRef.current.onclick = () => {
          addDebugInfo('Notification clicked');
          window.focus();
          if (notificationRef.current) {
            notificationRef.current.close();
          }
        };

        notificationRef.current.onclose = () => {
          addDebugInfo('Notification closed');
        };

        notificationRef.current.onerror = (error) => {
          addDebugInfo(`❌ Notification error: ${error}`);
        };

      } catch (error) {
        addDebugInfo(`❌ Failed to create notification: ${error}`);
      }
    };

    const flashTitleWarning = () => {
      let flashCount = 0;
      const flashInterval = setInterval(() => {
        document.title = flashCount % 2 === 0 
          ? `🚨 UJIAN BERAKHIR DALAM ${countdown} DETIK! 🚨` 
          : '⚠️ KEMBALI KE TAB UJIAN! ⚠️';
        flashCount++;
        
        if (flashCount >= 40 || !document.hidden) {
          clearInterval(flashInterval);
        }
      }, 500);
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        addDebugInfo('🔄 Tab became hidden - starting warning sequence');
        setShowWarning(true);
        setCountdown(10);
        
        createBeepSound();
        flashTitleWarning();
        
        if (Notification.permission === 'granted') {
          sendNotification('Kembali ke tab ujian SEKARANG! Ujian akan otomatis berakhir!', 10);
        } else if (Notification.permission === 'denied') {
          setNotificationDenied(true);
          addDebugInfo('❌ Notifications denied by user');
        } else {
          addDebugInfo(`⚠️ Notification permission: ${Notification.permission}`);
        }
        
        countdownRef.current = setInterval(() => {
          setCountdown((prev) => {
            const newCount = prev - 1;
            
            if (Notification.permission === 'granted' && newCount > 0) {
              sendNotification(`SEGERA KEMBALI! Ujian akan otomatis berakhir!`, newCount);
            }
            
            if (newCount <= 0) {
              if (countdownRef.current) {
                clearInterval(countdownRef.current);
              }
              if (notificationRef.current) {
                notificationRef.current.close();
              }
              addDebugInfo('⏰ Countdown finished - triggering auto-submit');
              if (onAutoSubmit) {
                onAutoSubmit();
              }
              return 0;
            }
            return newCount;
          });
        }, 1000);
      } else {
        addDebugInfo('✅ Tab became visible - stopping warning sequence');
        setShowWarning(false);
        setNotificationDenied(false);
        setCountdown(10);
        
        document.title = originalTitle.current;
        
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        
        if (notificationRef.current) {
          notificationRef.current.close();
          notificationRef.current = null;
        }
      }
    };

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = 'Apakah Anda yakin ingin meninggalkan halaman ujian? Jawaban Anda mungkin akan hilang.';
      return e.returnValue;
    };

    const requestNotificationPermission = async () => {
      if (!('Notification' in window)) {
        addDebugInfo('❌ Notification API not supported');
        setShowPermissionModal(true);
        return;
      }

      addDebugInfo(`Requesting notification permission. Current: ${Notification.permission}`);
      
      if (Notification.permission === 'default') {
        try {
          const permission = await Notification.requestPermission();
          setNotificationPermission(permission);
          addDebugInfo(`Permission result: ${permission}`);
          
          if (permission === 'granted') {
            // Send a test notification immediately
            setTimeout(() => {
              const testNotification = new Notification('✅ Notifikasi Aktif!', {
                body: 'Sistem keamanan ujian siap. Anda akan mendapat peringatan jika berpindah tab.',
                icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMyMkM1NUIiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+Cjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+Cjwvc3ZnPgo8L3N2Zz4K',
                tag: 'test-notification',
                requireInteraction: false
              });
              
              testNotification.onshow = () => {
                addDebugInfo('✅ Test notification shown!');
              };
              
              testNotification.onerror = (error) => {
                addDebugInfo(`❌ Test notification error: ${error}`);
              };
              
              setTimeout(() => {
                testNotification.close();
              }, 4000);
            }, 100);
              
          } else if (permission === 'denied') {
            addDebugInfo('❌ User denied notification permission');
            setShowPermissionModal(true);
          }
        } catch (error) {
          addDebugInfo(`❌ Permission request error: ${error}`);
          setShowPermissionModal(true);
        }
      } else if (Notification.permission === 'denied') {
        addDebugInfo('❌ Notifications previously denied');
        setShowPermissionModal(true);
      } else if (Notification.permission === 'granted') {
        addDebugInfo('✅ Notifications already granted');
      }
    };

    // Wait a bit before requesting permission to avoid blocking
    setTimeout(requestNotificationPermission, 1000);
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      
      if (countdownRef.current) {
        clearInterval(countdownRef.current);
      }
      
      if (notificationRef.current) {
        notificationRef.current.close();
      }
      
      if (originalTitle.current) {
        document.title = originalTitle.current;
      }
    };
  }, [enabled, onAutoSubmit, countdown]);

  const handleEnableNotifications = async () => {
    if (!('Notification' in window)) {
      addDebugInfo('❌ Notification API not supported');
      return;
    }

    try {
      addDebugInfo('🔄 Requesting notification permission...');
      const permission = await Notification.requestPermission();
      setNotificationPermission(permission);
      addDebugInfo(`Permission result: ${permission}`);
      
      if (permission === 'granted') {
        const successNotification = new Notification('🎉 Notifikasi Berhasil Diaktifkan!', {
          body: 'Sekarang Anda akan mendapat peringatan jika berpindah tab selama ujian.',
          icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiMyMkM1NUIiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+Cjxwb2x5bGluZSBwb2ludHM9IjIwIDYgOSAxNyA0IDEyIi8+Cjwvc3ZnPgo8L3N2Zz4K',
          requireInteraction: false
        });
        
        successNotification.onshow = () => {
          addDebugInfo('✅ Success notification shown!');
        };
        
        setTimeout(() => {
          successNotification.close();
        }, 4000);
        
        setShowPermissionModal(false);
      }
    } catch (error) {
      addDebugInfo(`❌ Error requesting notification permission: ${error}`);
    }
  };

  const testNotification = () => {
    if (Notification.permission === 'granted') {
      addDebugInfo('🧪 Testing notification...');
      const testNotif = new Notification('🧪 Test Notifikasi', {
        body: 'Ini adalah contoh notifikasi yang akan muncul saat Anda berpindah tab.',
        icon: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzIiIGZpbGw9IiM0Qjc3REIiLz4KPHN2ZyB4PSIxNiIgeT0iMTYiIHdpZHRoPSIzMiIgaGVpZ2h0PSIzMiIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+CjxwYXRoIGQ9Im0xMCAxNSA0LTQgNCA0Ii8+CjxwYXRoIGQ9Im0yMSA0LTcgNy03LTciLz4KPC9zdmc+Cjwvc3ZnPgo=',
        requireInteraction: true,
        tag: 'test-notification'
      });
      
      testNotif.onshow = () => {
        addDebugInfo('✅ Test notification shown!');
      };
      
      testNotif.onclick = () => {
        addDebugInfo('Test notification clicked');
        testNotif.close();
      };
      
      testNotif.onerror = (error) => {
        addDebugInfo(`❌ Test notification error: ${error}`);
      };
      
      setTimeout(() => {
        testNotif.close();
      }, 5000);
    } else {
      addDebugInfo(`❌ Cannot test - permission: ${Notification.permission}`);
    }
  };

  if (!enabled) {
    return <>{children}</>;
  }

  return (
    <div className="tw-relative tw-min-h-screen">
      {showWarning && (
        <div className="tw-fixed tw-top-0 tw-left-0 tw-right-0 tw-z-50 tw-bg-red-600 tw-text-white tw-shadow-lg tw-animate-pulse">
          <div className="tw-container tw-mx-auto tw-px-4 tw-py-3">
            <div className="tw-flex tw-items-center tw-justify-center tw-gap-3">
              <AlertTriangle className="tw-h-6 tw-w-6 tw-text-yellow-300 tw-animate-bounce" />
              <div className="tw-text-center">
                <div className="tw-font-bold tw-text-lg">
                  🚨 PERINGATAN: TAB TIDAK AKTIF!
                </div>
                <div className="tw-text-sm tw-mt-1">
                  {notificationPermission === 'granted' 
                    ? 'Cek notifikasi browser untuk countdown!' 
                    : `Auto-submit dalam: ${countdown} detik`
                  }
                </div>
                {notificationDenied && (
                  <div className="tw-text-xs tw-mt-1 tw-text-yellow-200">
                    Notifikasi diblokir - Ujian akan otomatis berakhir!
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="tw-fixed tw-top-4 tw-left-4 tw-z-50">
        <div className="tw-bg-white tw-rounded-lg tw-shadow-lg tw-p-3 tw-border tw-max-w-xs">
          <div className="tw-flex tw-items-center tw-gap-2 tw-mb-2">
            <Bell size={16} />
            <span className="tw-font-semibold tw-text-sm">Status Notifikasi</span>
          </div>
          <div className="tw-flex tw-items-center tw-gap-2">
            {notificationPermission === 'granted' ? (
              <CheckCircle className="tw-text-green-600" size={16} />
            ) : (
              <XCircle className="tw-text-red-600" size={16} />
            )}
            <span className="tw-text-xs">
              {notificationPermission === 'granted' ? 'Aktif' : 
               notificationPermission === 'denied' ? 'Diblokir' : 'Belum diizinkan'}
            </span>
          </div>
          {isSecureContext ? (
            <Badge bg="success" className="tw-mt-1 tw-text-xs">HTTPS ✓</Badge>
          ) : (
            <Badge bg="danger" className="tw-mt-1 tw-text-xs">HTTP ✗</Badge>
          )}
        </div>
      </div>

      {/* Test Button */}
      {notificationPermission === 'granted' && !showWarning && (
        <div className="tw-fixed tw-bottom-4 tw-right-4 tw-z-50 tw-space-y-2">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={testNotification}
            className="tw-bg-blue-50 tw-border-blue-300 tw-text-blue-700 hover:tw-bg-blue-100 tw-shadow-lg tw-block tw-w-full"
          >
            <Bell className="tw-mr-1" size={14} />
            Test Notifikasi
          </Button>
          
          {/* Debug Info Toggle */}
          <details className="tw-bg-white tw-rounded tw-shadow-lg tw-p-2 tw-border tw-text-xs">
            <summary className="tw-cursor-pointer tw-font-semibold">Debug Info</summary>
            <div className="tw-mt-2 tw-max-h-32 tw-overflow-y-auto tw-space-y-1">
              {debugInfo.slice(-10).map((info, index) => (
                <div key={index} className="tw-text-xs tw-font-mono tw-break-all">
                  {info}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      <Modal 
        show={showPermissionModal} 
        onHide={() => setShowPermissionModal(false)}
        centered
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="tw-bg-violet-50">
          <Modal.Title className="tw-text-violet-800 tw-flex tw-items-center">
            <Bell className="tw-mr-2 tw-text-violet-600" size={20} />
            Izinkan Notifikasi Browser
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="tw-p-4">
            <div className="tw-text-center tw-mb-4">
              <BellOff className="tw-h-16 tw-w-16 tw-text-amber-500 tw-mx-auto tw-mb-3" />
              <h3 className="tw-text-lg tw-font-semibold tw-text-gray-800 tw-mb-2">
                Notifikasi Diperlukan untuk Keamanan Ujian
              </h3>
            </div>

            {/* System Requirements */}
            <div className="tw-bg-blue-50 tw-border tw-border-blue-200 tw-rounded-lg tw-p-4 tw-mb-4">
              <h4 className="tw-font-semibold tw-text-blue-800 tw-mb-2">📋 Persyaratan Sistem:</h4>
              <ul className="tw-text-sm tw-text-blue-700 tw-space-y-1">
                <li className="tw-flex tw-items-center tw-gap-2">
                  {isSecureContext ? <CheckCircle size={14} className="tw-text-green-600" /> : <XCircle size={14} className="tw-text-red-600" />}
                  HTTPS Connection {isSecureContext ? '✓' : '✗'}
                </li>
                <li className="tw-flex tw-items-center tw-gap-2">
                  {notificationSupported ? <CheckCircle size={14} className="tw-text-green-600" /> : <XCircle size={14} className="tw-text-red-600" />}
                  Browser Support {notificationSupported ? '✓' : '✗'}
                </li>
                <li className="tw-flex tw-items-center tw-gap-2">
                  {notificationPermission === 'granted' ? <CheckCircle size={14} className="tw-text-green-600" /> : <XCircle size={14} className="tw-text-red-600" />}
                  User Permission {notificationPermission === 'granted' ? '✓' : '✗'}
                </li>
              </ul>
            </div>
            
            <div className="tw-bg-amber-50 tw-border tw-border-amber-200 tw-rounded-lg tw-p-4 tw-mb-4">
              <h4 className="tw-font-semibold tw-text-amber-800 tw-mb-2">💡 Cara kerja notifikasi:</h4>
              <ul className="tw-text-sm tw-text-amber-700 tw-space-y-1">
                <li>• Popup notifikasi muncul di layar saat berpindah tab</li>
                <li>• Countdown real-time dalam notifikasi</li>
                <li>• Klik notifikasi untuk kembali ke ujian</li>
                <li>• Bunyi dan getaran untuk menarik perhatian</li>
              </ul>
            </div>

            <div className="tw-bg-red-50 tw-border tw-border-red-200 tw-rounded-lg tw-p-4 tw-mb-4">
              <h4 className="tw-font-semibold tw-text-red-800 tw-mb-2">🚫 Troubleshooting:</h4>
              <ul className="tw-text-sm tw-text-red-700 tw-space-y-1">
                <li>• Pastikan website menggunakan HTTPS</li>
                <li>• Cek pengaturan notifikasi di browser</li>
                <li>• Matikan "Do Not Disturb" mode</li>
                <li>• Izinkan notifikasi dari situs ini</li>
              </ul>
            </div>

            <div className="tw-text-center">
              <p className="tw-text-gray-600 tw-text-sm tw-mb-4">
                Klik tombol di bawah, lalu pilih "Izinkan" pada popup browser
              </p>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button 
            variant="outline-danger" 
            onClick={() => setShowPermissionModal(false)}
            className="tw-border-2 tw-border-red-300 tw-text-red-700 hover:tw-bg-red-50"
          >
            <BellOff className="tw-mr-1" size={14} />
            Lanjut Tanpa Notifikasi (Berisiko)
          </Button>
          <Button 
            variant="primary" 
            onClick={handleEnableNotifications}
            className="tw-bg-violet-600 tw-border-0 hover:tw-bg-violet-700 tw-flex tw-items-center"
          >
            <Bell className="tw-mr-2" size={16} />
            Aktifkan Notifikasi Sekarang
          </Button>
        </Modal.Footer>
      </Modal>
      
      <div className={`tw-transition-all tw-duration-300 ${showWarning ? 'tw-mt-16' : ''}`}>
        {children}
      </div>
    </div>
  );
};

export default ChangeTabPrevention;
         