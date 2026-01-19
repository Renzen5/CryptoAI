'use client';

import { useState, useCallback } from 'react';
import Layout from '@/components/Layout';
import PairSelector from '@/components/PairSelector';
import TimeframeSelector from '@/components/TimeframeSelector';
import LanguageSelector from '@/components/LanguageSelector';
import AccuracyGauge from '@/components/AccuracyGauge';
import RobotLoader from '@/components/RobotLoader';
import SignalResult from '@/components/SignalResult';
import WinLossModal from '@/components/WinLossModal';
import ChartModal from '@/components/ChartModal';
import { CurrencyPair, CURRENCY_PAIRS, SignalDirection, LanguageCode, Signal } from '@/types';
import { hapticFeedback } from '@/lib/telegram';

export default function TradePage() {
  // Settings state
  const [selectedPair, setSelectedPair] = useState<CurrencyPair>(CURRENCY_PAIRS[0]);
  const [direction, setDirection] = useState<SignalDirection>('AUTO');
  const [timeframe, setTimeframe] = useState<number>(5);
  const [language, setLanguage] = useState<LanguageCode>('uk');
  const [accuracy, setAccuracy] = useState<number>(85);

  // Signal flow state
  const [isLoading, setIsLoading] = useState(false);
  const [currentSignal, setCurrentSignal] = useState<Signal | null>(null);
  const [showSignalResult, setShowSignalResult] = useState(false);
  const [showWinLoss, setShowWinLoss] = useState(false);
  const [signalResult, setSignalResult] = useState<'WIN' | 'LOSE' | null>(null);

  // Chart modal state
  const [showChart, setShowChart] = useState(false);

  // Generate signal
  const handleGetSignal = async () => {
    hapticFeedback.medium();
    setIsLoading(true);
    setShowSignalResult(false);
    setShowWinLoss(false);
    setSignalResult(null);

    try {
      const response = await fetch('/api/signal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pair: selectedPair,
          timeframe,
          direction,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate signal');
      }

      const signalData = await response.json();

      // Create full signal object
      const signal: Signal = {
        id: signalData.id,
        userId: 'temp_user', // Will be replaced with real user ID
        pair: selectedPair,
        direction: signalData.direction,
        timeframe: signalData.timeframe,
        accuracy: signalData.accuracy,
        entryTime: signalData.entryTime,
        expiryTime: signalData.expiryTime,
        aiReason: signalData.aiReason,
        createdAt: new Date().toISOString(),
      };

      setCurrentSignal(signal);
      setAccuracy(signalData.accuracy);
      hapticFeedback.success();

      // Show signal result
      setIsLoading(false);
      setShowSignalResult(true);
    } catch (error) {
      console.error('Error generating signal:', error);
      hapticFeedback.error();
      setIsLoading(false);
    }
  };

  // Handle signal time end
  const handleTimeEnd = useCallback((result: 'WIN' | 'LOSE') => {
    setSignalResult(result);
    setShowSignalResult(false);
    setShowWinLoss(true);
  }, []);

  // Handle new signal from result modal
  const handleNewSignal = () => {
    setShowSignalResult(false);
    handleGetSignal();
  };

  // Cancel signal
  const handleCancelSignal = () => {
    setShowSignalResult(false);
    setCurrentSignal(null);
  };

  // Close win/loss modal
  const handleCloseWinLoss = () => {
    setShowWinLoss(false);
    setSignalResult(null);
    setCurrentSignal(null);
  };

  // Open chart
  const handleOpenChart = () => {
    hapticFeedback.light();
    setShowChart(true);
  };

  return (
    <>
      <Layout>
        <div className="px-4 py-6 relative z-10">

          {/* Header */}
          <div className="flex items-center justify-center mb-6 relative">
            <h1 className="text-4xl font-bold text-white tracking-widest text-shadow-lg">
              TRADE
            </h1>
          </div>

          {/* Settings Row */}
          <div className="flex gap-3 mb-8">
            <div className="flex-[2]">
              <PairSelector value={selectedPair} onChange={setSelectedPair} />
            </div>
            <div className="flex flex-1 gap-2">
              <TimeframeSelector value={timeframe} onChange={setTimeframe} />
              <LanguageSelector value={language} onChange={setLanguage} />
            </div>
          </div>

          {/* Info Text */}
          <div className="text-center mb-8 px-4">
            <p className="text-white font-bold text-lg leading-relaxed drop-shadow-md">
              Натисніть кнопку 'Отримати новий сигнал', щоб почати
            </p>
          </div>

          {/* Accuracy Gauge */}
          <div className="flex justify-center mb-10">
            <AccuracyGauge value={accuracy} />
          </div>

          {/* Get Signal Button */}
          <button
            onClick={handleGetSignal}
            disabled={isLoading}
            className={`
              w-full py-5 rounded-2xl text-lg font-bold uppercase tracking-wide
              text-white shadow-[0_4px_14px_0_rgba(37,99,235,0.39)]
              transition-all duration-300 active:scale-[0.98]
              ${isLoading
                ? 'bg-blue-800/50 cursor-not-allowed'
                : 'bg-[#2563eb] hover:bg-blue-600'
              }
            `}
          >
            ОТРИМАТИ НОВИЙ СИГНАЛ
          </button>

        </div>
      </Layout>

      {/* Robot Loader Overlay */}
      <RobotLoader isVisible={isLoading} />

      {/* Signal Result Modal */}
      <SignalResult
        signal={currentSignal}
        isVisible={showSignalResult}
        onNewSignal={handleNewSignal}
        onCancel={handleCancelSignal}
        onTimeEnd={handleTimeEnd}
      />

      {/* Win/Loss Modal */}
      <WinLossModal
        isVisible={showWinLoss}
        result={signalResult}
        onClose={handleCloseWinLoss}
        pairName={currentSignal?.pair.name}
      />

      {/* Chart Modal */}
      <ChartModal
        isOpen={showChart}
        onClose={() => setShowChart(false)}
        symbol={selectedPair.name}
        initialInterval={String(timeframe)}
      />
    </>
  );
}
