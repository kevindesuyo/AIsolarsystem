import React, { useState, useEffect } from 'react';

type TutorialModalProps = {
  onClose: () => void;
};

const TUTORIAL_STEPS = [
  {
    title: 'SOLAR OPS へようこそ！',
    content: 'このシミュレーターでは、太陽系の惑星運動を体験できます。重力に従って動く惑星たちを観察し、独自の軌道を設計しましょう。',
    icon: '🌍',
  },
  {
    title: '時間コントロール',
    content: '左パネルの時間制御で、シミュレーションの速度を変更できます。一時停止して観察したり、高速で軌道の変化を確認できます。',
    icon: '⏱️',
  },
  {
    title: '惑星の追加と編集',
    content: '「惑星編集」セクションで新しい惑星を追加できます。惑星の質量、サイズ、軌道半径を調整して、安定した軌道を目指しましょう。',
    icon: '🪐',
  },
  {
    title: 'ドラッグ&ドロップ',
    content: 'キャンバス上で惑星をドラッグして位置を変更できます。惑星を選択すると、軌道予測が表示されます。',
    icon: '👆',
  },
  {
    title: 'ミッションに挑戦',
    content: '右上のミッションボードでチャレンジに挑戦できます。ミッションを達成してスコアを稼ぎましょう！',
    icon: '🎯',
  },
  {
    title: 'キーボードショートカット',
    content: [
      'Space: 一時停止/再開',
      '+/=: 速度アップ',
      '-: 速度ダウン',
      'R: リセット',
      'Z: ズームイン',
      'X: ズームアウト',
      '?: ヘルプ表示',
    ].join('\n'),
    icon: '⌨️',
  },
];

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in animation
    requestAnimationFrame(() => setIsVisible(true));
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 200);
  };

  const handleNext = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = TUTORIAL_STEPS[currentStep];

  return (
    <div 
      className="tutorial-overlay" 
      style={{ opacity: isVisible ? 1 : 0 }}
      onClick={handleClose}
    >
      <div 
        className="tutorial-modal glass-panel" 
        onClick={(e) => e.stopPropagation()}
        style={{ transform: isVisible ? 'scale(1)' : 'scale(0.9)' }}
      >
        <div className="tutorial-icon">{step.icon}</div>
        <h2 className="tutorial-title">{step.title}</h2>
        <div className="tutorial-content">
          {step.content.split('\n').map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
        
        <div className="tutorial-progress">
          {TUTORIAL_STEPS.map((_, index) => (
            <div 
              key={index}
              className={`tutorial-dot ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
              onClick={() => setCurrentStep(index)}
            />
          ))}
        </div>
        
        <div className="tutorial-buttons">
          <button 
            onClick={handlePrev} 
            disabled={currentStep === 0}
            className="tutorial-btn secondary"
          >
            前へ
          </button>
          <button onClick={handleNext} className="tutorial-btn primary">
            {currentStep === TUTORIAL_STEPS.length - 1 ? '始める！' : '次へ'}
          </button>
        </div>
        
        <button className="tutorial-skip" onClick={handleClose}>
          スキップ
        </button>
      </div>
    </div>
  );
};

export default TutorialModal;
