import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { 
  X, Heart, Star, Zap, Sparkles, Music, GameController2, 
  Palette, Camera, Rocket, Users, FileText, Settings, 
  BarChart3, PieChart, TrendingUp, Shield, Database,
  Clock, Award, BookOpen, Target, Briefcase
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from 'recharts';

// Button Component (simplified for demo)
const ButtonGradient = ({ children, onClick, variant = "primary", size = "md", className = "" }) => {
  const sizeClasses = {
    sm: "tw-px-3 tw-py-1.5 tw-text-sm",
    md: "tw-px-4 tw-py-2 tw-text-base",
    lg: "tw-px-6 tw-py-3 tw-text-lg"
  };
  
  const variantClasses = {
    primary: "tw-bg-gradient-to-r tw-from-purple-500 tw-to-blue-500 hover:tw-from-purple-600 hover:tw-to-blue-600",
    secondary: "tw-bg-gradient-to-r tw-from-gray-400 tw-to-gray-500 hover:tw-from-gray-500 hover:tw-to-gray-600",
    success: "tw-bg-gradient-to-r tw-from-green-500 tw-to-emerald-500 hover:tw-from-green-600 hover:tw-to-emerald-600",
    danger: "tw-bg-gradient-to-r tw-from-red-500 tw-to-pink-500 hover:tw-from-red-600 hover:tw-to-pink-600"
  };

  return (
    <button
      onClick={onClick}
      className={`${sizeClasses[size]} ${variantClasses[variant]} tw-text-white tw-rounded-lg tw-font-medium tw-transition-all tw-duration-200 tw-shadow-md hover:tw-shadow-lg ${className}`}
    >
      {children}
    </button>
  );
};

// Sample Data
const chartData = [
  { name: 'Jan', value: 400, growth: 24 },
  { name: 'Feb', value: 300, growth: 13 },
  { name: 'Mar', value: 200, growth: 98 },
  { name: 'Apr', value: 278, growth: 39 },
  { name: 'May', value: 189, growth: 48 },
];

const pieData = [
  { name: 'Desktop', value: 40, color: '#8B5CF6' },
  { name: 'Mobile', value: 35, color: '#06B6D4' },
  { name: 'Tablet', value: 25, color: '#10B981' },
];

// Base Modal Template
const BaseModal = ({ 
  show, 
  onHide, 
  title, 
  subtitle, 
  children, 
  width = "80vw", 
  height = "85vh",
  icon,
  headerClassName = "",
  bodyClassName = "",
  footerClassName = "",
  customStyles = {},
  showFooter = true
}) => {
  const customDialogClass = 'custom-centered-modal';
  
  const modalStyles = {
    width: width.includes('vw') ? `${Math.min(parseInt(width), 95)}vw` : width,
    maxWidth: width.includes('vw') ? `${Math.min(parseInt(width), 95)}vw` : width,
    height: height.includes('vh') ? `${Math.min(parseInt(height), 90)}vh` : height,
    maxHeight: height.includes('vh') ? `${Math.min(parseInt(height), 90)}vh` : height,
    ...customStyles
  };

  return (
    <>
      <style jsx global>{`
        .custom-centered-modal {
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          min-height: calc(100vh - 2rem) !important;
        }
        .custom-centered-modal .modal-content { margin: 0 !important; width: auto !important; height: auto !important; }
        .modal.show .modal-dialog.custom-centered-modal { transform: none !important; margin: 1rem !important; max-width: none !important; width: auto !important; }
        @media (max-width: 576px) { .custom-centered-modal { margin: 0.5rem !important; min-height: calc(100vh - 1rem) !important; } }
        .fixed-modal-body { overflow-y: auto !important; overflow-x: hidden !important; }
        .disable-child-scroll * { max-height: none !important; }
      `}</style>

      <Modal 
        show={show} 
        onHide={onHide}
        scrollable={true}
        dialogClassName={customDialogClass}
        backdrop={true}
        keyboard={true}
      >
        <div 
          style={modalStyles}
          className="tw-rounded-xl tw-overflow-hidden tw-flex tw-flex-col tw-bg-white tw-min-w-80 tw-w-full"
        >
          <Modal.Header className={`tw-border-0 tw-relative tw-flex-shrink-0 tw-p-4 ${headerClassName}`}>
            <div className="tw-w-full">
              <div className="tw-flex tw-items-center tw-gap-3 tw-mb-3">
                <div className="tw-flex-shrink-0">
                  {icon}
                </div>
                <div className="tw-flex-1 tw-min-w-0">
                  <Modal.Title className="tw-font-bold tw-text-xl tw-mb-1 tw-truncate">{title}</Modal.Title>
                  {subtitle && <p className="tw-text-sm tw-opacity-80 tw-truncate">{subtitle}</p>}
                </div>
                <button 
                  onClick={onHide} 
                  className="tw-p-2 tw-rounded-lg tw-transition-colors tw-flex-shrink-0 tw-opacity-70 hover:tw-opacity-100"
                  type="button"
                >
                  <X className="tw-w-5 tw-h-5" />
                </button>
              </div>
            </div>
          </Modal.Header>

          <Modal.Body className={`tw-flex-1 fixed-modal-body disable-child-scroll tw-p-6 ${bodyClassName}`}>
            {children}
          </Modal.Body>

          {showFooter && (
            <Modal.Footer className={`tw-flex-shrink-0 tw-p-4 tw-border-t ${footerClassName}`}>
              <div className="tw-flex tw-gap-2 tw-justify-end tw-w-full">
                <ButtonGradient onClick={onHide} variant="secondary" size="md">
                  Cancel
                </ButtonGradient>
                <ButtonGradient onClick={onHide} variant="primary" size="md">
                  Save Changes
                </ButtonGradient>
              </div>
            </Modal.Footer>
          )}
        </div>
      </Modal>
    </>
  );
};

// 10 Attractive Modals for Youth
const GlowModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Glow ${type}`}
    subtitle="Shine bright like a diamond ✨"
    icon={<div className="tw-bg-gradient-to-r tw-from-pink-500 tw-to-purple-500 tw-p-3 tw-rounded-full tw-animate-pulse"><Sparkles className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-pink-400 tw-via-purple-400 tw-to-indigo-400 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-pink-50 tw-via-purple-50 tw-to-indigo-50"
    footerClassName="tw-bg-gradient-to-r tw-from-pink-100 tw-to-purple-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border-2 tw-border-pink-200">
        <div className="tw-absolute -tw-top-3 -tw-right-3 tw-bg-gradient-to-r tw-from-pink-500 tw-to-purple-500 tw-text-white tw-rounded-full tw-w-8 tw-h-8 tw-flex tw-items-center tw-justify-center tw-text-sm tw-font-bold tw-animate-bounce">
          ✨
        </div>
        {type === 'Dashboard' && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1c0e8" />
              <XAxis dataKey="name" stroke="#8b5cf6" />
              <YAxis stroke="#8b5cf6" />
              <Tooltip contentStyle={{ backgroundColor: '#fdf2f8', border: '2px solid #f9a8d4' }} />
              <Line type="monotone" dataKey="value" stroke="url(#glowGradient)" strokeWidth={3} />
              <defs>
                <linearGradient id="glowGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border-2 tw-border-pink-200 tw-rounded-xl tw-focus:border-purple-400 tw-focus:ring-2 tw-focus:ring-purple-200 tw-transition-all" placeholder="Your awesome name ✨" />
            <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-pink-200 tw-rounded-xl tw-focus:border-purple-400 tw-focus:ring-2 tw-focus:ring-purple-200 tw-transition-all tw-h-24" placeholder="Tell us your story... 💫"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-text-4xl tw-mb-4">🌟</div>
            <h3 className="tw-text-2xl tw-font-bold tw-text-purple-600 tw-mb-2">You're Amazing!</h3>
            <p className="tw-text-gray-600">Keep shining and never stop believing in yourself. You've got this! 💪✨</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const NeonModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Neon ${type}`}
    subtitle="Electric vibes ⚡"
    icon={<div className="tw-bg-black tw-p-3 tw-rounded-full tw-border-2 tw-border-cyan-400 tw-shadow-lg tw-shadow-cyan-400/50"><Zap className="tw-w-6 tw-h-6 tw-text-cyan-400" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-gray-900 tw-via-purple-900 tw-to-gray-900 tw-text-cyan-400 tw-border-b-2 tw-border-cyan-400"
    bodyClassName="tw-bg-gradient-to-br tw-from-gray-900 tw-via-purple-900 tw-to-gray-900 tw-text-white"
    footerClassName="tw-bg-gray-900 tw-border-t-2 tw-border-cyan-400"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-gray-800 tw-rounded-2xl tw-border-2 tw-border-cyan-400 tw-shadow-lg tw-shadow-cyan-400/20">
        <div className="tw-absolute tw-inset-0 tw-bg-gradient-to-r tw-from-cyan-400/10 tw-to-purple-400/10 tw-rounded-2xl tw-animate-pulse"></div>
        <div className="tw-relative tw-z-10">
          {type === 'Dashboard' && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#06b6d4" />
                <YAxis stroke="#06b6d4" />
                <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '2px solid #06b6d4', color: '#06b6d4' }} />
                <Bar dataKey="value" fill="url(#neonGradient)" />
                <defs>
                  <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
          {type === 'Form' && (
            <div className="tw-space-y-4">
              <input className="tw-w-full tw-p-3 tw-bg-gray-700 tw-border-2 tw-border-cyan-400 tw-rounded-xl tw-text-cyan-400 tw-placeholder-gray-400 tw-focus:border-purple-400 tw-focus:ring-2 tw-focus:ring-purple-400/50 tw-transition-all" placeholder="Enter the matrix... ⚡" />
              <textarea className="tw-w-full tw-p-3 tw-bg-gray-700 tw-border-2 tw-border-cyan-400 tw-rounded-xl tw-text-cyan-400 tw-placeholder-gray-400 tw-focus:border-purple-400 tw-focus:ring-2 tw-focus:ring-purple-400/50 tw-transition-all tw-h-24" placeholder="Your electric thoughts... 🌐"></textarea>
            </div>
          )}
          {type === 'Information' && (
            <div className="tw-text-center">
              <div className="tw-text-4xl tw-mb-4 tw-text-cyan-400">⚡</div>
              <h3 className="tw-text-2xl tw-font-bold tw-text-cyan-400 tw-mb-2">System Online</h3>
              <p className="tw-text-gray-300">Welcome to the future. Your journey starts here. Ready to level up? 🚀</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </BaseModal>
);

const GradientModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Gradient ${type}`}
    subtitle="Colors of creativity 🎨"
    icon={<div className="tw-bg-gradient-to-r tw-from-red-500 tw-via-yellow-500 tw-to-green-500 tw-p-3 tw-rounded-full tw-animate-spin tw-animation-duration-3000"><Palette className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-red-400 tw-via-yellow-400 tw-via-green-400 tw-via-blue-400 tw-to-purple-400 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-red-50 tw-via-yellow-50 tw-via-green-50 tw-to-blue-50"
    footerClassName="tw-bg-gradient-to-r tw-from-red-100 tw-via-yellow-100 tw-to-green-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-2xl tw-border-4 tw-border-transparent tw-bg-clip-padding" style={{backgroundImage: 'linear-gradient(white, white), linear-gradient(45deg, #ef4444, #f59e0b, #10b981, #3b82f6, #8b5cf6)', backgroundOrigin: 'border-box', backgroundClip: 'content-box, border-box'}}>
        {type === 'Dashboard' && (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#fbbf24" />
              <XAxis dataKey="name" stroke="#ef4444" />
              <YAxis stroke="#10b981" />
              <Tooltip contentStyle={{ background: 'linear-gradient(45deg, #fef3c7, #ecfdf5)', border: '2px solid #8b5cf6' }} />
              <Line type="monotone" dataKey="value" stroke="url(#rainbowGradient)" strokeWidth={4} />
              <defs>
                <linearGradient id="rainbowGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#ef4444" />
                  <stop offset="25%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="75%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border-4 tw-border-transparent tw-rounded-xl tw-bg-gradient-to-r tw-from-red-100 tw-to-blue-100 tw-focus:from-red-200 tw-focus:to-blue-200 tw-transition-all" placeholder="Paint your dreams here 🎨" />
            <textarea className="tw-w-full tw-p-3 tw-border-4 tw-border-transparent tw-rounded-xl tw-bg-gradient-to-r tw-from-green-100 tw-to-purple-100 tw-focus:from-green-200 tw-focus:to-purple-200 tw-transition-all tw-h-24" placeholder="Express your colorful thoughts... 🌈"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-text-4xl tw-mb-4">🌈</div>
            <h3 className="tw-text-2xl tw-font-bold tw-bg-gradient-to-r tw-from-red-500 tw-via-green-500 tw-to-blue-500 tw-bg-clip-text tw-text-transparent tw-mb-2">Be Colorful!</h3>
            <p className="tw-text-gray-600">Life is like a rainbow - you need both rain and sunshine to make it beautiful! 🎨✨</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const MusicModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Music ${type}`}
    subtitle="Feel the rhythm 🎵"
    icon={<div className="tw-bg-gradient-to-r tw-from-purple-600 tw-to-pink-600 tw-p-3 tw-rounded-full tw-animate-bounce"><Music className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-purple-500 tw-via-pink-500 tw-to-red-500 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-purple-50 tw-via-pink-50 tw-to-red-50"
    footerClassName="tw-bg-gradient-to-r tw-from-purple-100 tw-to-pink-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl">
        <div className="tw-absolute tw-top-2 tw-right-2 tw-flex tw-gap-1">
          <div className="tw-w-3 tw-h-6 tw-bg-purple-400 tw-rounded-sm tw-animate-pulse"></div>
          <div className="tw-w-3 tw-h-8 tw-bg-pink-400 tw-rounded-sm tw-animate-pulse" style={{animationDelay: '0.1s'}}></div>
          <div className="tw-w-3 tw-h-4 tw-bg-red-400 tw-rounded-sm tw-animate-pulse" style={{animationDelay: '0.2s'}}></div>
          <div className="tw-w-3 tw-h-7 tw-bg-purple-400 tw-rounded-sm tw-animate-pulse" style={{animationDelay: '0.3s'}}></div>
        </div>
        {type === 'Dashboard' && (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
              <XAxis dataKey="name" stroke="#a855f7" />
              <YAxis stroke="#a855f7" />
              <Tooltip contentStyle={{ backgroundColor: '#fdf2f8', border: '2px solid #ec4899' }} />
              <Bar dataKey="value" fill="url(#musicGradient)" />
              <defs>
                <linearGradient id="musicGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#a855f7" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="#ec4899" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0.8}/>
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border-2 tw-border-purple-200 tw-rounded-xl tw-focus:border-pink-400 tw-focus:ring-2 tw-focus:ring-pink-200 tw-transition-all" placeholder="What's your favorite song? 🎵" />
            <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-purple-200 tw-rounded-xl tw-focus:border-pink-400 tw-focus:ring-2 tw-focus:ring-pink-200 tw-transition-all tw-h-24" placeholder="Share your musical story... 🎶"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-text-4xl tw-mb-4">🎵</div>
            <h3 className="tw-text-2xl tw-font-bold tw-text-purple-600 tw-mb-2">Music is Life</h3>
            <p className="tw-text-gray-600">Where words fail, music speaks. Let your heart dance to the rhythm! 💃🕺</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const GameModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Game ${type}`}
    subtitle="Level up your experience 🎮"
    icon={<div className="tw-bg-gradient-to-r tw-from-green-500 tw-to-blue-500 tw-p-3 tw-rounded-full tw-animate-pulse"><GameController2 className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-green-500 tw-via-blue-500 tw-to-purple-500 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-green-50 tw-via-blue-50 tw-to-purple-50"
    footerClassName="tw-bg-gradient-to-r tw-from-green-100 tw-to-blue-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border-2 tw-border-green-200">
        <div className="tw-absolute tw-top-4 tw-right-4 tw-flex tw-gap-2">
          <div className="tw-w-4 tw-h-4 tw-bg-green-500 tw-rounded-full tw-animate-ping"></div>
          <div className="tw-w-4 tw-h-4 tw-bg-blue-500 tw-rounded-full tw-animate-ping" style={{animationDelay: '0.5s'}}></div>
        </div>
        {type === 'Dashboard' && (
          <div className="tw-space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                <XAxis dataKey="name" stroke="#22c55e" />
                <YAxis stroke="#3b82f6" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '2px solid #22c55e' }} />
                <Line type="monotone" dataKey="value" stroke="url(#gameGradient)" strokeWidth={3} />
                <defs>
                  <linearGradient id="gameGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
            <div className="tw-flex tw-justify-around tw-text-center">
              <div>
                <div className="tw-text-2xl tw-font-bold tw-text-green-600">1,337</div>
                <div className="tw-text-sm tw-text-gray-500">Score</div>
              </div>
              <div>
                <div className="tw-text-2xl tw-font-bold tw-text-blue-600">Level 42</div>
                <div className="tw-text-sm tw-text-gray-500">Current</div>
              </div>
              <div>
                <div className="tw-text-2xl tw-font-bold tw-text-purple-600">99+</div>
                <div className="tw-text-sm tw-text-gray-500">Achievements</div>
              </div>
            </div>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border-2 tw-border-green-200 tw-rounded-xl tw-focus:border-blue-400 tw-focus:ring-2 tw-focus:ring-blue-200 tw-transition-all" placeholder="Enter your gamer tag 🎮" />
            <select className="tw-w-full tw-p-3 tw-border-2 tw-border-green-200 tw-rounded-xl tw-focus:border-blue-400 tw-focus:ring-2 tw-focus:ring-blue-200 tw-transition-all">
              <option>Choose your class</option>
              <option>🗡️ Warrior</option>
              <option>🏹 Archer</option>
              <option>🧙‍♂️ Mage</option>
              <option>🛡️ Tank</option>
            </select>
            <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-green-200 tw-rounded-xl tw-focus:border-blue-400 tw-focus:ring-2 tw-focus:ring-blue-200 tw-transition-all tw-h-24" placeholder="Describe your gaming style... ⚔️"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-text-4xl tw-mb-4">🎮</div>
            <h3 className="tw-text-2xl tw-font-bold tw-text-green-600 tw-mb-2">Game On!</h3>
            <p className="tw-text-gray-600">Ready Player One? Let's embark on an epic adventure together! 🚀✨</p>
            <div className="tw-mt-4 tw-flex tw-justify-center tw-gap-2">
              <span className="tw-px-3 tw-py-1 tw-bg-green-100 tw-text-green-700 tw-rounded-full tw-text-sm">+100 XP</span>
              <span className="tw-px-3 tw-py-1 tw-bg-blue-100 tw-text-blue-700 tw-rounded-full tw-text-sm">Achievement Unlocked</span>
            </div>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const HeartModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Heart ${type}`}
    subtitle="Made with love 💖"
    icon={<div className="tw-bg-gradient-to-r tw-from-pink-500 tw-to-red-500 tw-p-3 tw-rounded-full tw-animate-pulse"><Heart className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-pink-400 tw-via-red-400 tw-to-rose-400 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-pink-50 tw-via-red-50 tw-to-rose-50"
    footerClassName="tw-bg-gradient-to-r tw-from-pink-100 tw-to-red-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border-2 tw-border-pink-200">
        <div className="tw-absolute tw-inset-0 tw-opacity-10">
          <div className="tw-absolute tw-top-4 tw-left-4 tw-text-pink-400 tw-text-2xl tw-animate-pulse">💕</div>
          <div className="tw-absolute tw-top-8 tw-right-8 tw-text-red-400 tw-text-lg tw-animate-pulse" style={{animationDelay: '0.5s'}}>💖</div>
          <div className="tw-absolute tw-bottom-6 tw-left-8 tw-text-rose-400 tw-text-xl tw-animate-pulse" style={{animationDelay: '1s'}}>💗</div>
        </div>
        <div className="tw-relative tw-z-10">
          {type === 'Dashboard' && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#fce7f3" />
                <XAxis dataKey="name" stroke="#ec4899" />
                <YAxis stroke="#be185d" />
                <Tooltip contentStyle={{ backgroundColor: '#fdf2f8', border: '2px solid #ec4899' }} />
                <Bar dataKey="value" fill="url(#heartGradient)" />
                <defs>
                  <linearGradient id="heartGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#be185d" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
          {type === 'Form' && (
            <div className="tw-space-y-4">
              <input className="tw-w-full tw-p-3 tw-border-2 tw-border-pink-200 tw-rounded-xl tw-focus:border-red-400 tw-focus:ring-2 tw-focus:ring-red-200 tw-transition-all" placeholder="What makes your heart flutter? 💕" />
              <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-pink-200 tw-rounded-xl tw-focus:border-red-400 tw-focus:ring-2 tw-focus:ring-red-200 tw-transition-all tw-h-24" placeholder="Share what you love most... 💖"></textarea>
            </div>
          )}
          {type === 'Information' && (
            <div className="tw-text-center">
              <div className="tw-text-4xl tw-mb-4">💖</div>
              <h3 className="tw-text-2xl tw-font-bold tw-text-pink-600 tw-mb-2">Spread Love</h3>
              <p className="tw-text-gray-600">Love is the only force capable of transforming an enemy into a friend. Keep loving! 💕✨</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </BaseModal>
);

const StarModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Star ${type}`}
    subtitle="Reach for the stars ⭐"
    icon={<div className="tw-bg-gradient-to-r tw-from-yellow-400 tw-to-orange-400 tw-p-3 tw-rounded-full tw-animate-spin tw-animation-duration-3000"><Star className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-yellow-400 tw-via-orange-400 tw-to-red-400 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-yellow-50 tw-via-orange-50 tw-to-red-50"
    footerClassName="tw-bg-gradient-to-r tw-from-yellow-100 tw-to-orange-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border-2 tw-border-yellow-200">
        <div className="tw-absolute tw-inset-0 tw-opacity-20">
          <div className="tw-absolute tw-top-2 tw-right-4 tw-text-yellow-400 tw-animate-bounce">⭐</div>
          <div className="tw-absolute tw-top-6 tw-left-2 tw-text-orange-400 tw-animate-bounce" style={{animationDelay: '0.3s'}}>✨</div>
          <div className="tw-absolute tw-bottom-4 tw-right-2 tw-text-red-400 tw-animate-bounce" style={{animationDelay: '0.6s'}}>🌟</div>
        </div>
        <div className="tw-relative tw-z-10">
          {type === 'Dashboard' && (
            <div className="tw-space-y-4">
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fef3c7" />
                  <XAxis dataKey="name" stroke="#f59e0b" />
                  <YAxis stroke="#ea580c" />
                  <Tooltip contentStyle={{ backgroundColor: '#fffbeb', border: '2px solid #f59e0b' }} />
                  <Line type="monotone" dataKey="value" stroke="url(#starGradient)" strokeWidth={3} />
                  <defs>
                    <linearGradient id="starGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#ea580c" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
              <div className="tw-grid tw-grid-cols-5 tw-gap-2 tw-text-center">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="tw-text-yellow-400 tw-text-2xl tw-animate-pulse" style={{animationDelay: `${i * 0.2}s`}}>⭐</div>
                ))}
              </div>
            </div>
          )}
          {type === 'Form' && (
            <div className="tw-space-y-4">
              <input className="tw-w-full tw-p-3 tw-border-2 tw-border-yellow-200 tw-rounded-xl tw-focus:border-orange-400 tw-focus:ring-2 tw-focus:ring-orange-200 tw-transition-all" placeholder="What's your biggest dream? ⭐" />
              <div className="tw-flex tw-gap-2">
                <span className="tw-text-gray-600">Rate your experience:</span>
                {[1,2,3,4,5].map(i => (
                  <Star key={i} className="tw-w-5 tw-h-5 tw-text-yellow-400 tw-cursor-pointer hover:tw-text-yellow-500" fill="currentColor" />
                ))}
              </div>
              <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-yellow-200 tw-rounded-xl tw-focus:border-orange-400 tw-focus:ring-2 tw-focus:ring-orange-200 tw-transition-all tw-h-24" placeholder="Tell us about your stellar journey... 🌟"></textarea>
            </div>
          )}
          {type === 'Information' && (
            <div className="tw-text-center">
              <div className="tw-text-4xl tw-mb-4">⭐</div>
              <h3 className="tw-text-2xl tw-font-bold tw-text-yellow-600 tw-mb-2">You're a Star!</h3>
              <p className="tw-text-gray-600">Shoot for the moon. Even if you miss, you'll land among the stars! 🌟✨</p>
            </div>
          )}
        </div>
      </div>
    </div>
  </BaseModal>
);

const RocketModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Rocket ${type}`}
    subtitle="Blast off to success 🚀"
    icon={<div className="tw-bg-gradient-to-r tw-from-blue-600 tw-to-purple-600 tw-p-3 tw-rounded-full tw-animate-bounce"><Rocket className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-blue-500 tw-via-purple-500 tw-to-indigo-500 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-blue-50 tw-via-purple-50 tw-to-indigo-50"
    footerClassName="tw-bg-gradient-to-r tw-from-blue-100 tw-to-purple-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border-2 tw-border-blue-200 tw-overflow-hidden">
        <div className="tw-absolute -tw-top-2 -tw-right-2 tw-w-20 tw-h-20 tw-bg-gradient-to-br tw-from-blue-200 tw-to-purple-200 tw-rounded-full tw-opacity-30 tw-animate-ping"></div>
        <div className="tw-relative tw-z-10">
          {type === 'Dashboard' && (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
                <XAxis dataKey="name" stroke="#3b82f6" />
                <YAxis stroke="#6366f1" />
                <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '2px solid #3b82f6' }} />
                <Bar dataKey="value" fill="url(#rocketGradient)" />
                <defs>
                  <linearGradient id="rocketGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
          {type === 'Form' && (
            <div className="tw-space-y-4">
              <input className="tw-w-full tw-p-3 tw-border-2 tw-border-blue-200 tw-rounded-xl tw-focus:border-purple-400 tw-focus:ring-2 tw-focus:ring-purple-200 tw-transition-all" placeholder="Mission objective 🚀" />
              <select className="tw-w-full tw-p-3 tw-border-2 tw-border-blue-200 tw-rounded-xl tw-focus:border-purple-400 tw-focus:ring-2 tw-focus:ring-purple-200 tw-transition-all">
                <option>Select destination</option>
                <option>🌙 Moon</option>
                <option>🪐 Mars</option>
                <option>⭐ Alpha Centauri</option>
                <option>🌌 Beyond</option>
              </select>
              <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-blue-200 tw-rounded-xl tw-focus:border-purple-400 tw-focus:ring-2 tw-focus:ring-purple-200 tw-transition-all tw-h-24" placeholder="Describe your space journey... 🌌"></textarea>
            </div>
          )}
          {type === 'Information' && (
            <div className="tw-text-center">
              <div className="tw-text-4xl tw-mb-4">🚀</div>
              <h3 className="tw-text-2xl tw-font-bold tw-text-blue-600 tw-mb-2">Ready for Launch</h3>
              <p className="tw-text-gray-600">The sky is not the limit, it's just the beginning. Prepare for liftoff! 🌌✨</p>
              <div className="tw-mt-4">
                <div className="tw-bg-blue-100 tw-rounded-full tw-h-2 tw-w-full">
                  <div className="tw-bg-blue-500 tw-h-2 tw-rounded-full tw-w-3/4 tw-animate-pulse"></div>
                </div>
                <div className="tw-text-sm tw-text-blue-600 tw-mt-1">Launch Progress: 75%</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </BaseModal>
);

const CameraModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Camera ${type}`}
    subtitle="Capture the moment 📸"
    icon={<div className="tw-bg-gradient-to-r tw-from-teal-500 tw-to-cyan-500 tw-p-3 tw-rounded-full tw-animate-pulse"><Camera className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-teal-400 tw-via-cyan-400 tw-to-blue-400 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-teal-50 tw-via-cyan-50 tw-to-blue-50"
    footerClassName="tw-bg-gradient-to-r tw-from-teal-100 tw-to-cyan-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border-2 tw-border-teal-200">
        <div className="tw-absolute tw-top-4 tw-right-4 tw-w-3 tw-h-3 tw-bg-red-500 tw-rounded-full tw-animate-pulse"></div>
        <div className="tw-absolute tw-top-4 tw-right-9 tw-text-xs tw-text-red-500 tw-animate-pulse">REC</div>
        {type === 'Dashboard' && (
          <div className="tw-space-y-4">
            <div className="tw-grid tw-grid-cols-3 tw-gap-4 tw-mb-4">
              <div className="tw-bg-teal-100 tw-p-3 tw-rounded-lg tw-text-center">
                <div className="tw-text-2xl tw-font-bold tw-text-teal-600">1.2K</div>
                <div className="tw-text-sm tw-text-gray-500">Photos</div>
              </div>
              <div className="tw-bg-cyan-100 tw-p-3 tw-rounded-lg tw-text-center">
                <div className="tw-text-2xl tw-font-bold tw-text-cyan-600">342</div>
                <div className="tw-text-sm tw-text-gray-500">Videos</div>
              </div>
              <div className="tw-bg-blue-100 tw-p-3 tw-rounded-lg tw-text-center">
                <div className="tw-text-2xl tw-font-bold tw-text-blue-600">89</div>
                <div className="tw-text-sm tw-text-gray-500">Albums</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={150}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e6fffa" />
                <XAxis dataKey="name" stroke="#14b8a6" />
                <YAxis stroke="#0891b2" />
                <Tooltip contentStyle={{ backgroundColor: '#f0fdfa', border: '2px solid #14b8a6' }} />
                <Line type="monotone" dataKey="value" stroke="url(#cameraGradient)" strokeWidth={3} />
                <defs>
                  <linearGradient id="cameraGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#0891b2" stopOpacity={0.8}/>
                  </linearGradient>
                </defs>
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border-2 tw-border-teal-200 tw-rounded-xl tw-focus:border-cyan-400 tw-focus:ring-2 tw-focus:ring-cyan-200 tw-transition-all" placeholder="Photo title 📸" />
            <select className="tw-w-full tw-p-3 tw-border-2 tw-border-teal-200 tw-rounded-xl tw-focus:border-cyan-400 tw-focus:ring-2 tw-focus:ring-cyan-200 tw-transition-all">
              <option>Camera mode</option>
              <option>📷 Portrait</option>
              <option>🌅 Landscape</option>
              <option>🌃 Night</option>
              <option>🎬 Video</option>
            </select>
            <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-teal-200 tw-rounded-xl tw-focus:border-cyan-400 tw-focus:ring-2 tw-focus:ring-cyan-200 tw-transition-all tw-h-24" placeholder="Describe your shot... 📹"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-text-4xl tw-mb-4">📸</div>
            <h3 className="tw-text-2xl tw-font-bold tw-text-teal-600 tw-mb-2">Picture Perfect</h3>
            <p className="tw-text-gray-600">Every picture tells a story. What story will you capture today? 📷✨</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const PartyModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Party ${type}`}
    subtitle="Let's celebrate! 🎉"
    icon={<div className="tw-bg-gradient-to-r tw-from-orange-500 tw-to-pink-500 tw-p-3 tw-rounded-full tw-animate-bounce"><Users className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-orange-400 tw-via-pink-400 tw-to-purple-400 tw-text-white"
    bodyClassName="tw-bg-gradient-to-br tw-from-orange-50 tw-via-pink-50 tw-to-purple-50"
    footerClassName="tw-bg-gradient-to-r tw-from-orange-100 tw-to-pink-100"
  >
    <div className="tw-space-y-6">
      <div className="tw-relative tw-p-6 tw-bg-white tw-rounded-2xl tw-shadow-xl tw-border-2 tw-border-orange-200 tw-overflow-hidden">
        <div className="tw-absolute tw-inset-0 tw-opacity-20">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className={`tw-absolute tw-w-2 tw-h-2 tw-rounded-full tw-animate-bounce`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#f97316', '#ec4899', '#8b5cf6', '#06b6d4', '#10b981'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${1 + Math.random()}s`
              }}
            />
          ))}
        </div>
        <div className="tw-relative tw-z-10">
          {type === 'Dashboard' && (
            <div className="tw-space-y-4">
              <div className="tw-grid tw-grid-cols-2 tw-gap-4 tw-mb-4">
                <div className="tw-bg-orange-100 tw-p-3 tw-rounded-lg tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-orange-600">127</div>
                  <div className="tw-text-sm tw-text-gray-500">Guests</div>
                </div>
                <div className="tw-bg-pink-100 tw-p-3 tw-rounded-lg tw-text-center">
                  <div className="tw-text-2xl tw-font-bold tw-text-pink-600">23</div>
                  <div className="tw-text-sm tw-text-gray-500">Events</div>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#fed7aa" />
                  <XAxis dataKey="name" stroke="#ea580c" />
                  <YAxis stroke="#db2777" />
                  <Tooltip contentStyle={{ backgroundColor: '#fff7ed', border: '2px solid #ea580c' }} />
                  <Bar dataKey="value" fill="url(#partyGradient)" />
                  <defs>
                    <linearGradient id="partyGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ea580c" stopOpacity={0.8}/>
                      <stop offset="50%" stopColor="#db2777" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
          {type === 'Form' && (
            <div className="tw-space-y-4">
              <input className="tw-w-full tw-p-3 tw-border-2 tw-border-orange-200 tw-rounded-xl tw-focus:border-pink-400 tw-focus:ring-2 tw-focus:ring-pink-200 tw-transition-all" placeholder="Party name 🎉" />
              <div className="tw-grid tw-grid-cols-2 tw-gap-4">
                <input type="date" className="tw-w-full tw-p-3 tw-border-2 tw-border-orange-200 tw-rounded-xl tw-focus:border-pink-400 tw-focus:ring-2 tw-focus:ring-pink-200 tw-transition-all" />
                <input type="time" className="tw-w-full tw-p-3 tw-border-2 tw-border-orange-200 tw-rounded-xl tw-focus:border-pink-400 tw-focus:ring-2 tw-focus:ring-pink-200 tw-transition-all" />
              </div>
              <textarea className="tw-w-full tw-p-3 tw-border-2 tw-border-orange-200 tw-rounded-xl tw-focus:border-pink-400 tw-focus:ring-2 tw-focus:ring-pink-200 tw-transition-all tw-h-24" placeholder="Party details... 🎊"></textarea>
            </div>
          )}
          {type === 'Information' && (
            <div className="tw-text-center">
              <div className="tw-text-4xl tw-mb-4">🎉</div>
              <h3 className="tw-text-2xl tw-font-bold tw-text-orange-600 tw-mb-2">Party Time!</h3>
              <p className="tw-text-gray-600">Life is a party, dress like it! Let's make some memories together! 🎊✨</p>
              <div className="tw-mt-4 tw-text-2xl">🎈🎂🎁🎉🎊</div>
            </div>
          )}
        </div>
      </div>
    </div>
  </BaseModal>
);

// 10 Professional Modals
const ExecutiveModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Executive ${type}`}
    subtitle="Leadership dashboard"
    icon={<div className="tw-bg-gradient-to-r tw-from-gray-700 tw-to-gray-900 tw-p-3 tw-rounded-lg"><Briefcase className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gradient-to-r tw-from-gray-800 tw-to-gray-900 tw-text-white tw-border-b"
    bodyClassName="tw-bg-gray-50"
    footerClassName="tw-bg-white tw-border-gray-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-gray-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-3 tw-gap-4">
              <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-blue-500">
                <div className="tw-text-2xl tw-font-bold tw-text-blue-600">$2.4M</div>
                <div className="tw-text-sm tw-text-gray-600">Revenue</div>
              </div>
              <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-green-500">
                <div className="tw-text-2xl tw-font-bold tw-text-green-600">847</div>
                <div className="tw-text-sm tw-text-gray-600">Clients</div>
              </div>
              <div className="tw-bg-purple-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-purple-500">
                <div className="tw-text-2xl tw-font-bold tw-text-purple-600">94%</div>
                <div className="tw-text-sm tw-text-gray-600">Growth</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" stroke="#374151" />
                <YAxis stroke="#374151" />
                <Tooltip contentStyle={{ backgroundColor: '#f9fafb', border: '1px solid #d1d5db' }} />
                <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500 tw-focus:ring-1 tw-focus:ring-blue-500" placeholder="First Name" />
              <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500 tw-focus:ring-1 tw-focus:ring-blue-500" placeholder="Last Name" />
            </div>
            <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500 tw-focus:ring-1 tw-focus:ring-blue-500" placeholder="Company Position" />
            <textarea className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500 tw-focus:ring-1 tw-focus:ring-blue-500 tw-h-24" placeholder="Executive Summary"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <Briefcase className="tw-w-8 tw-h-8 tw-text-gray-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Executive Overview</h3>
            <p className="tw-text-gray-600">Strategic insights for informed decision-making and sustainable business growth.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const AnalyticsModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Analytics ${type}`}
    subtitle="Data-driven insights"
    icon={<div className="tw-bg-blue-600 tw-p-3 tw-rounded-lg"><BarChart3 className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-blue-600 tw-text-white"
    bodyClassName="tw-bg-blue-50"
    footerClassName="tw-bg-white tw-border-blue-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-blue-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-4 tw-gap-4">
              <div className="tw-text-center tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-blue-600">1.2M</div>
                <div className="tw-text-xs tw-text-gray-500">Page Views</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-green-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-green-600">47.3%</div>
                <div className="tw-text-xs tw-text-gray-500">Conversion</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-purple-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-purple-600">3.2s</div>
                <div className="tw-text-xs tw-text-gray-500">Load Time</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-red-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-red-600">2.1%</div>
                <div className="tw-text-xs tw-text-gray-500">Bounce Rate</div>
              </div>
            </div>
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <ResponsiveContainer width="100%" height={150}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0f2fe" />
                  <XAxis dataKey="name" stroke="#0369a1" fontSize={12} />
                  <YAxis stroke="#0369a1" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#f0f9ff', border: '1px solid #0284c7' }} />
                  <Line type="monotone" dataKey="value" stroke="#0284c7" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
              <ResponsiveContainer width="100%" height={150}>
                <RechartsPieChart>
                  <Tooltip />
                  <RechartsPieChart data={pieData} cx="50%" cy="50%" outerRadius={50}>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500">
              <option>Select Metric</option>
              <option>Page Views</option>
              <option>User Sessions</option>
              <option>Conversion Rate</option>
              <option>Revenue</option>
            </select>
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <input type="date" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500" />
              <input type="date" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500" />
            </div>
            <textarea className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-blue-500 tw-h-24" placeholder="Analysis Notes"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-blue-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <BarChart3 className="tw-w-8 tw-h-8 tw-text-blue-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Analytics Report</h3>
            <p className="tw-text-gray-600">Comprehensive data analysis to drive business intelligence and strategic decisions.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const SecurityModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Security ${type}`}
    subtitle="Protected environment"
    icon={<div className="tw-bg-red-600 tw-p-3 tw-rounded-lg"><Shield className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-red-600 tw-text-white"
    bodyClassName="tw-bg-red-50"
    footerClassName="tw-bg-white tw-border-red-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-red-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-3 tw-gap-4">
              <div className="tw-bg-green-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-green-500">
                <div className="tw-text-lg tw-font-bold tw-text-green-600">Secure</div>
                <div className="tw-text-sm tw-text-gray-600">System Status</div>
              </div>
              <div className="tw-bg-yellow-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-yellow-500">
                <div className="tw-text-lg tw-font-bold tw-text-yellow-600">3</div>
                <div className="tw-text-sm tw-text-gray-600">Warnings</div>
              </div>
              <div className="tw-bg-red-50 tw-p-4 tw-rounded-lg tw-border-l-4 tw-border-red-500">
                <div className="tw-text-lg tw-font-bold tw-text-red-600">0</div>
                <div className="tw-text-sm tw-text-gray-600">Threats</div>
              </div>
            </div>
            <div className="tw-space-y-3">
              <div className="tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-green-50 tw-rounded-lg">
                <span className="tw-text-sm tw-font-medium">SSL Certificate</span>
                <span className="tw-px-2 tw-py-1 tw-bg-green-100 tw-text-green-700 tw-rounded tw-text-xs">Active</span>
              </div>
              <div className="tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-green-50 tw-rounded-lg">
                <span className="tw-text-sm tw-font-medium">Firewall</span>
                <span className="tw-px-2 tw-py-1 tw-bg-green-100 tw-text-green-700 tw-rounded tw-text-xs">Protected</span>
              </div>
              <div className="tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-yellow-50 tw-rounded-lg">
                <span className="tw-text-sm tw-font-medium">Password Policy</span>
                <span className="tw-px-2 tw-py-1 tw-bg-yellow-100 tw-text-yellow-700 tw-rounded tw-text-xs">Update Required</span>
              </div>
            </div>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input type="password" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-red-500" placeholder="Current Password" />
            <input type="password" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-red-500" placeholder="New Password" />
            <input type="password" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-red-500" placeholder="Confirm Password" />
            <div className="tw-flex tw-items-center tw-gap-2">
              <input type="checkbox" className="tw-rounded tw-border-gray-300" />
              <label className="tw-text-sm tw-text-gray-600">Enable two-factor authentication</label>
            </div>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-red-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <Shield className="tw-w-8 tw-h-8 tw-text-red-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Security Center</h3>
            <p className="tw-text-gray-600">Your data is protected with enterprise-grade security measures and encryption protocols.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const DatabaseModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Database ${type}`}
    subtitle="Data management"
    icon={<div className="tw-bg-green-600 tw-p-3 tw-rounded-lg"><Database className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-green-600 tw-text-white"
    bodyClassName="tw-bg-green-50"
    footerClassName="tw-bg-white tw-border-green-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-green-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-4 tw-gap-4">
              <div className="tw-text-center tw-p-3 tw-bg-green-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-green-600">2.4TB</div>
                <div className="tw-text-xs tw-text-gray-500">Storage Used</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-blue-600">847K</div>
                <div className="tw-text-xs tw-text-gray-500">Records</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-purple-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-purple-600">99.9%</div>
                <div className="tw-text-xs tw-text-gray-500">Uptime</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-orange-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-orange-600">12ms</div>
                <div className="tw-text-xs tw-text-gray-500">Latency</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#dcfce7" />
                <XAxis dataKey="name" stroke="#166534" fontSize={12} />
                <YAxis stroke="#166534" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #22c55e' }} />
                <Bar dataKey="value" fill="#22c55e" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-green-500" placeholder="Table Name" />
            <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-green-500">
              <option>Select Database</option>
              <option>Production</option>
              <option>Development</option>
              <option>Testing</option>
            </select>
            <textarea className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-green-500 tw-h-24 tw-font-mono tw-text-sm" placeholder="SELECT * FROM users WHERE..."></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-green-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <Database className="tw-w-8 tw-h-8 tw-text-green-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Database Overview</h3>
            <p className="tw-text-gray-600">Reliable data storage with automated backups and optimized query performance.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const SettingsModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Settings ${type}`}
    subtitle="System configuration"
    icon={<div className="tw-bg-gray-600 tw-p-3 tw-rounded-lg"><Settings className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-gray-600 tw-text-white"
    bodyClassName="tw-bg-gray-50"
    footerClassName="tw-bg-white tw-border-gray-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-gray-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-4">
            <div className="tw-grid tw-grid-cols-2 tw-gap-6">
              <div>
                <h4 className="tw-font-medium tw-text-gray-900 tw-mb-3">System Preferences</h4>
                <div className="tw-space-y-2">
                  <div className="tw-flex tw-items-center tw-justify-between tw-p-2">
                    <span className="tw-text-sm">Dark Mode</span>
                    <div className="tw-w-10 tw-h-5 tw-bg-gray-200 tw-rounded-full tw-cursor-pointer">
                      <div className="tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-shadow tw-translate-x-0 tw-transition-transform"></div>
                    </div>
                  </div>
                  <div className="tw-flex tw-items-center tw-justify-between tw-p-2">
                    <span className="tw-text-sm">Notifications</span>
                    <div className="tw-w-10 tw-h-5 tw-bg-blue-500 tw-rounded-full tw-cursor-pointer">
                      <div className="tw-w-4 tw-h-4 tw-bg-white tw-rounded-full tw-shadow tw-translate-x-5 tw-transition-transform"></div>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="tw-font-medium tw-text-gray-900 tw-mb-3">Performance</h4>
                <div className="tw-space-y-3">
                  <div>
                    <div className="tw-flex tw-justify-between tw-text-sm tw-mb-1">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2">
                      <div className="tw-bg-blue-500 tw-h-2 tw-rounded-full tw-w-1/2"></div>
                    </div>
                  </div>
                  <div>
                    <div className="tw-flex tw-justify-between tw-text-sm tw-mb-1">
                      <span>Memory</span>
                      <span>62%</span>
                    </div>
                    <div className="tw-w-full tw-bg-gray-200 tw-rounded-full tw-h-2">
                      <div className="tw-bg-green-500 tw-h-2 tw-rounded-full tw-w-3/5"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-gray-500" placeholder="Application Name" />
              <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-gray-500">
                <option>Select Theme</option>
                <option>Light</option>
                <option>Dark</option>
                <option>Auto</option>
              </select>
            </div>
            <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-gray-500">
              <option>Default Language</option>
              <option>English</option>
              <option>Indonesian</option>
              <option>Japanese</option>
            </select>
            <textarea className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-gray-500 tw-h-24" placeholder="Configuration Notes"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-gray-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <Settings className="tw-w-8 tw-h-8 tw-text-gray-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">System Settings</h3>
            <p className="tw-text-gray-600">Configure your application preferences and system parameters for optimal performance.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const ReportsModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Reports ${type}`}
    subtitle="Business intelligence"
    icon={<div className="tw-bg-purple-600 tw-p-3 tw-rounded-lg"><FileText className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-purple-600 tw-text-white"
    bodyClassName="tw-bg-purple-50"
    footerClassName="tw-bg-white tw-border-purple-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-purple-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-3 tw-gap-4">
              <div className="tw-text-center tw-p-4 tw-bg-purple-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-purple-600">247</div>
                <div className="tw-text-sm tw-text-gray-600">Reports Generated</div>
              </div>
              <div className="tw-text-center tw-p-4 tw-bg-blue-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-blue-600">18</div>
                <div className="tw-text-sm tw-text-gray-600">Scheduled</div>
              </div>
              <div className="tw-text-center tw-p-4 tw-bg-green-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-green-600">94%</div>
                <div className="tw-text-sm tw-text-gray-600">Accuracy</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                <XAxis dataKey="name" stroke="#7c3aed" fontSize={12} />
                <YAxis stroke="#7c3aed" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#faf5ff', border: '1px solid #8b5cf6' }} />
                <Line type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-purple-500" placeholder="Report Title" />
            <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-purple-500">
              <option>Report Type</option>
              <option>Financial Summary</option>
              <option>Performance Analysis</option>
              <option>User Activity</option>
              <option>Sales Report</option>
            </select>
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <input type="date" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-purple-500" />
              <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-purple-500">
                <option>Output Format</option>
                <option>PDF</option>
                <option>Excel</option>
                <option>CSV</option>
              </select>
            </div>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-purple-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <FileText className="tw-w-8 tw-h-8 tw-text-purple-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Business Reports</h3>
            <p className="tw-text-gray-600">Generate comprehensive reports with real-time data and automated insights for better decision making.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const TimeModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Time ${type}`}
    subtitle="Time management"
    icon={<div className="tw-bg-indigo-600 tw-p-3 tw-rounded-lg"><Clock className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-indigo-600 tw-text-white"
    bodyClassName="tw-bg-indigo-50"
    footerClassName="tw-bg-white tw-border-indigo-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-indigo-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-4 tw-gap-4">
              <div className="tw-text-center tw-p-3 tw-bg-indigo-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-indigo-600">8.5h</div>
                <div className="tw-text-xs tw-text-gray-500">Today</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-blue-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-blue-600">42h</div>
                <div className="tw-text-xs tw-text-gray-500">This Week</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-green-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-green-600">12</div>
                <div className="tw-text-xs tw-text-gray-500">Projects</div>
              </div>
              <div className="tw-text-center tw-p-3 tw-bg-purple-50 tw-rounded-lg">
                <div className="tw-text-xl tw-font-bold tw-text-purple-600">94%</div>
                <div className="tw-text-xs tw-text-gray-500">Efficiency</div>
              </div>
            </div>
            <div className="tw-space-y-3">
              <div className="tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                <div>
                  <div className="tw-text-sm tw-font-medium">Website Redesign</div>
                  <div className="tw-text-xs tw-text-gray-500">2h 15m active</div>
                </div>
                <div className="tw-w-3 tw-h-3 tw-bg-green-500 tw-rounded-full"></div>
              </div>
              <div className="tw-flex tw-items-center tw-justify-between tw-p-3 tw-bg-gray-50 tw-rounded-lg">
                <div>
                  <div className="tw-text-sm tw-font-medium">Client Meeting Prep</div>
                  <div className="tw-text-xs tw-text-gray-500">45m completed</div>
                </div>
                <div className="tw-w-3 tw-h-3 tw-bg-gray-300 tw-rounded-full"></div>
              </div>
            </div>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-indigo-500" placeholder="Task Name" />
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <input type="time" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-indigo-500" />
              <input type="time" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-indigo-500" />
            </div>
            <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-indigo-500">
              <option>Project Category</option>
              <option>Development</option>
              <option>Design</option>
              <option>Marketing</option>
              <option>Administration</option>
            </select>
            <textarea className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-indigo-500 tw-h-20" placeholder="Task Description"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-indigo-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <Clock className="tw-w-8 tw-h-8 tw-text-indigo-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Time Tracking</h3>
            <p className="tw-text-gray-600">Monitor productivity and manage time allocation across projects with detailed analytics.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const PerformanceModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Performance ${type}`}
    subtitle="System metrics"
    icon={<div className="tw-bg-emerald-600 tw-p-3 tw-rounded-lg"><TrendingUp className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-emerald-600 tw-text-white"
    bodyClassName="tw-bg-emerald-50"
    footerClassName="tw-bg-white tw-border-emerald-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-emerald-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <div className="tw-bg-emerald-50 tw-p-4 tw-rounded-lg">
                <div className="tw-text-lg tw-font-bold tw-text-emerald-600">Response Time</div>
                <div className="tw-text-3xl tw-font-bold tw-text-emerald-700">142ms</div>
                <div className="tw-text-sm tw-text-emerald-600">↓ 12% from last week</div>
              </div>
              <div className="tw-bg-blue-50 tw-p-4 tw-rounded-lg">
                <div className="tw-text-lg tw-font-bold tw-text-blue-600">Throughput</div>
                <div className="tw-text-3xl tw-font-bold tw-text-blue-700">1.2K</div>
                <div className="tw-text-sm tw-text-blue-600">↑ 8% from last week</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ecfdf5" />
                <XAxis dataKey="name" stroke="#059669" fontSize={12} />
                <YAxis stroke="#059669" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#f0fdf4', border: '1px solid #10b981' }} />
                <Line type="monotone" dataKey="value" stroke="#10b981" strokeWidth={2} />
                <Line type="monotone" dataKey="growth" stroke="#06b6d4" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-emerald-500">
              <option>Select Metric</option>
              <option>CPU Usage</option>
              <option>Memory Usage</option>
              <option>Response Time</option>
              <option>Throughput</option>
            </select>
            <div className="tw-grid tw-grid-cols-2 tw-gap-4">
              <input type="number" className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-emerald-500" placeholder="Threshold Value" />
              <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-emerald-500">
                <option>Alert Type</option>
                <option>Email</option>
                <option>SMS</option>
                <option>Slack</option>
              </select>
            </div>
            <textarea className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-emerald-500 tw-h-20" placeholder="Performance Notes"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-emerald-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <TrendingUp className="tw-w-8 tw-h-8 tw-text-emerald-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Performance Metrics</h3>
            <p className="tw-text-gray-600">Real-time monitoring of system performance with automated alerts and optimization recommendations.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

const AwardModal = ({ show, onHide, type }) => (
  <BaseModal
    show={show}
    onHide={onHide}
    title={`Award ${type}`}
    subtitle="Recognition system"
    icon={<div className="tw-bg-yellow-600 tw-p-3 tw-rounded-lg"><Award className="tw-w-6 tw-h-6 tw-text-white" /></div>}
    headerClassName="tw-bg-yellow-600 tw-text-white"
    bodyClassName="tw-bg-yellow-50"
    footerClassName="tw-bg-white tw-border-yellow-200"
  >
    <div className="tw-space-y-6">
      <div className="tw-bg-white tw-p-6 tw-rounded-lg tw-border tw-border-yellow-200 tw-shadow-sm">
        {type === 'Dashboard' && (
          <div className="tw-space-y-6">
            <div className="tw-grid tw-grid-cols-3 tw-gap-4">
              <div className="tw-text-center tw-p-4 tw-bg-yellow-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-yellow-600">47</div>
                <div className="tw-text-sm tw-text-gray-600">Awards Given</div>
              </div>
              <div className="tw-text-center tw-p-4 tw-bg-orange-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-orange-600">12</div>
                <div className="tw-text-sm tw-text-gray-600">Categories</div>
              </div>
              <div className="tw-text-center tw-p-4 tw-bg-red-50 tw-rounded-lg">
                <div className="tw-text-2xl tw-font-bold tw-text-red-600">156</div>
                <div className="tw-text-sm tw-text-gray-600">Nominees</div>
              </div>
            </div>
            <div className="tw-space-y-3">
              <div className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-yellow-50 tw-rounded-lg">
                <div className="tw-w-8 tw-h-8 tw-bg-yellow-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-sm">🏆</div>
                <div className="tw-flex-1">
                  <div className="tw-text-sm tw-font-medium">Employee of the Month</div>
                  <div className="tw-text-xs tw-text-gray-500">Outstanding Performance</div>
                </div>
                <div className="tw-text-sm tw-text-yellow-600 tw-font-medium">John Doe</div>
              </div>
              <div className="tw-flex tw-items-center tw-gap-3 tw-p-3 tw-bg-orange-50 tw-rounded-lg">
                <div className="tw-w-8 tw-h-8 tw-bg-orange-500 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-text-white tw-text-sm">🥇</div>
                <div className="tw-flex-1">
                  <div className="tw-text-sm tw-font-medium">Innovation Award</div>
                  <div className="tw-text-xs tw-text-gray-500">Creative Solutions</div>
                </div>
                <div className="tw-text-sm tw-text-orange-600 tw-font-medium">Sarah Smith</div>
              </div>
            </div>
          </div>
        )}
        {type === 'Form' && (
          <div className="tw-space-y-4">
            <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-yellow-500" placeholder="Award Name" />
            <select className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-yellow-500">
              <option>Award Category</option>
              <option>🏆 Achievement</option>
              <option>🌟 Excellence</option>
              <option>💡 Innovation</option>
              <option>🤝 Teamwork</option>
            </select>
            <input className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-yellow-500" placeholder="Recipient Name" />
            <textarea className="tw-w-full tw-p-3 tw-border tw-border-gray-300 tw-rounded-lg tw-focus:border-yellow-500 tw-h-24" placeholder="Award Description & Criteria"></textarea>
          </div>
        )}
        {type === 'Information' && (
          <div className="tw-text-center">
            <div className="tw-w-16 tw-h-16 tw-bg-yellow-100 tw-rounded-full tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4">
              <Award className="tw-w-8 tw-h-8 tw-text-yellow-600" />
            </div>
            <h3 className="tw-text-xl tw-font-semibold tw-text-gray-900 tw-mb-2">Recognition Program</h3>
            <p className="tw-text-gray-600">Celebrate achievements and motivate excellence through our comprehensive award system.</p>
          </div>
        )}
      </div>
    </div>
  </BaseModal>
);

// Main Demo Component
const ModalDemo = () => {
  const [currentModal, setCurrentModal] = useState(null);
  const [modalType, setModalType] = useState('Dashboard');
  
  const attractiveModals = [
    { name: 'Glow', component: GlowModal, color: 'from-pink-500 to-purple-500' },
    { name: 'Neon', component: NeonModal, color: 'from-gray-900 to-cyan-500' },
    { name: 'Gradient', component: GradientModal, color: 'from-red-500 via-yellow-500 to-green-500' },
    { name: 'Music', component: MusicModal, color: 'from-purple-500 to-pink-500' },
    { name: 'Game', component: GameModal, color: 'from-green-500 to-blue-500' },
    { name: 'Heart', component: HeartModal, color: 'from-pink-500 to-red-500' },
    { name: 'Star', component: StarModal, color: 'from-yellow-400 to-orange-400' },
    { name: 'Rocket', component: RocketModal, color: 'from-blue-500 to-purple-500' },
    { name: 'Camera', component: CameraModal, color: 'from-teal-500 to-cyan-500' },
    { name: 'Party', component: PartyModal, color: 'from-orange-500 to-pink-500' },
  ];

  const professionalModals = [
    { name: 'Executive', component: ExecutiveModal, color: 'from-gray-700 to-gray-900' },
    { name: 'Analytics', component: AnalyticsModal, color: 'from-blue-600 to-blue-800' },
    { name: 'Security', component: SecurityModal, color: 'from-red-600 to-red-800' },
    { name: 'Database', component: DatabaseModal, color: 'from-green-600 to-green-800' },
    { name: 'Settings', component: SettingsModal, color: 'from-gray-600 to-gray-800' },
    { name: 'Reports', component: ReportsModal, color: 'from-purple-600 to-purple-800' },
    { name: 'Time', component: TimeModal, color: 'from-indigo-600 to-indigo-800' },
    { name: 'Performance', component: PerformanceModal, color: 'from-emerald-600 to-emerald-800' },
    { name: 'Learning', component: BookOpen, color: 'from-blue-600 to-indigo-600' },
    { name: 'Award', component: AwardModal, color: 'from-yellow-600 to-yellow-800' },
  ];

  const openModal = (modalName, component) => {
    setCurrentModal({ name: modalName, component });
  };

  const closeModal = () => {
    setCurrentModal(null);
  };

  const CurrentModalComponent = currentModal?.component;

  return (
    <div className="tw-min-h-screen tw-bg-gradient-to-br tw-from-purple-100 tw-via-blue-50 tw-to-indigo-100 tw-p-8">
      <div className="tw-max-w-7xl tw-mx-auto">
        {/* Header */}
        <div className="tw-text-center tw-mb-12">
          <h1 className="tw-text-4xl tw-font-bold tw-text-gray-900 tw-mb-4">
            Modal Templates Showcase
          </h1>
          <p className="tw-text-xl tw-text-gray-600 tw-mb-8">
            20 Beautiful Modal Designs - 10 Attractive for Youth + 10 Professional
          </p>
          
          {/* Type Selector */}
          <div className="tw-flex tw-justify-center tw-gap-4 tw-mb-8">
            {['Dashboard', 'Form', 'Information'].map(type => (
              <ButtonGradient
                key={type}
                onClick={() => setModalType(type)}
                variant={modalType === type ? 'primary' : 'secondary'}
                className={`tw-transition-all ${modalType === type ? 'tw-scale-105' : ''}`}
              >
                {type}
              </ButtonGradient>
            ))}
          </div>
        </div>

        {/* Attractive Modals Section */}
        <div className="tw-mb-16">
          <h2 className="tw-text-3xl tw-font-bold tw-text-gray-900 tw-mb-8 tw-text-center">
            🎨 Attractive Modals (Youth-Focused)
          </h2>
          <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 md:tw-grid-cols-5 tw-gap-6">
            {attractiveModals.map((modal, index) => (
              <div
                key={modal.name}
                onClick={() => openModal(modal.name, modal.component)}
                className="tw-bg-white tw-rounded-2xl tw-p-6 tw-shadow-lg tw-cursor-pointer tw-transition-all tw-duration-300 hover:tw-scale-105 hover:tw-shadow-xl tw-border-2 tw-border-transparent hover:tw-border-purple-300"
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-r ${modal.color} tw-rounded-2xl tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4 tw-shadow-lg`}>
                  <div className="tw-text-white tw-text-2xl tw-font-bold">
                    {index + 1}
                  </div>
                </div>
                <h3 className="tw-text-lg tw-font-bold tw-text-gray-900 tw-text-center tw-mb-2">
                  {modal.name}
                </h3>
                <p className="tw-text-sm tw-text-gray-600 tw-text-center">
                  {modalType}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Professional Modals Section */}
        <div>
          <h2 className="tw-text-3xl tw-font-bold tw-text-gray-900 tw-mb-8 tw-text-center">
            💼 Professional Modals (Business-Focused)
          </h2>
          <div className="tw-grid tw-grid-cols-2 sm:tw-grid-cols-3 md:tw-grid-cols-5 tw-gap-6">
            {professionalModals.map((modal, index) => (
              <div
                key={modal.name}
                onClick={() => openModal(modal.name, modal.component)}
                className="tw-bg-white tw-rounded-lg tw-p-6 tw-shadow-md tw-cursor-pointer tw-transition-all tw-duration-300 hover:tw-scale-105 hover:tw-shadow-lg tw-border tw-border-gray-200 hover:tw-border-gray-400"
              >
                <div className={`tw-w-16 tw-h-16 tw-bg-gradient-to-r ${modal.color} tw-rounded-lg tw-flex tw-items-center tw-justify-center tw-mx-auto tw-mb-4`}>
                  <div className="tw-text-white tw-text-xl tw-font-semibold">
                    {index + 11}
                  </div>
                </div>
                <h3 className="tw-text-lg tw-font-semibold tw-text-gray-900 tw-text-center tw-mb-2">
                  {modal.name}
                </h3>
                <p className="tw-text-sm tw-text-gray-600 tw-text-center">
                  {modalType}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Current Modal Display */}
        {currentModal && CurrentModalComponent && (
          <CurrentModalComponent
            show={true}
            onHide={closeModal}
            type={modalType}
          />
        )}
      </div>
    </div>
  );
};

export default ModalDemo;