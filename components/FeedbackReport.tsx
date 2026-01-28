import React from 'react';
import { ConversationFeedback } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface FeedbackReportProps {
  feedback: ConversationFeedback;
  onRestart: () => void;
}

const ScoreCard: React.FC<{ title: string; score: number; reasoning: string; color: string }> = ({
  title,
  score,
  reasoning,
  color
}) => {
  const data = [
    { name: 'Score', value: score },
    { name: 'Remaining', value: 100 - score },
  ];

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
      <div className="w-32 h-32 relative mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={55}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell key="cell-0" fill={color} />
              <Cell key="cell-1" fill="#f1f5f9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-2xl font-bold text-slate-800">{score}</span>
        </div>
      </div>
      <p className="text-sm text-slate-600 text-center">{reasoning}</p>
    </div>
  );
};

export const FeedbackReport: React.FC<FeedbackReportProps> = ({ feedback, onRestart }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 pb-20">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Conversation Analysis</h2>
          <p className="text-slate-500">Here's how you performed in the session.</p>
        </div>
        <button
          onClick={onRestart}
          className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        >
          Start New Practice
        </button>
      </div>

      {/* Overall Summary */}
      <div className="bg-indigo-50 border border-indigo-100 p-6 rounded-xl mb-8">
        <h3 className="text-indigo-900 font-semibold mb-2 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.456-2.456L14.25 6l1.035-.259a3.375 3.375 0 002.456-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
          </svg>
          Overall Summary
        </h3>
        <p className="text-indigo-800 leading-relaxed">{feedback.overallSummary}</p>
      </div>

      {/* Scores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <ScoreCard
          title="Clarity"
          score={feedback.clarity.score}
          reasoning={feedback.clarity.reasoning}
          color="#3b82f6" // blue-500
        />
        <ScoreCard
          title="Confidence"
          score={feedback.confidence.score}
          reasoning={feedback.confidence.reasoning}
          color="#10b981" // emerald-500
        />
      </div>

      {/* Filler Words */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-8">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Detected Filler Words</h3>
        {feedback.fillerWords.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {feedback.fillerWords.map((word, idx) => (
              <span key={idx} className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium">
                {word}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 italic">No significant filler words detected. Great job!</p>
        )}
      </div>

      {/* Improvements */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Suggestions for Improvement</h3>
        <div className="space-y-6">
          {feedback.suggestions.map((suggestion, idx) => (
            <div key={idx} className="border-l-4 border-blue-500 pl-4 py-1">
              <div className="mb-2">
                <span className="text-xs uppercase font-bold text-slate-400 tracking-wide">You Said</span>
                <p className="text-slate-600 mt-1 italic">"{suggestion.original}"</p>
              </div>
              <div className="mb-2">
                <span className="text-xs uppercase font-bold text-green-600 tracking-wide">Better Alternative</span>
                <p className="text-slate-800 font-medium mt-1">"{suggestion.improved}"</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-lg">{suggestion.explanation}</p>
              </div>
            </div>
          ))}
          {feedback.suggestions.length === 0 && (
             <p className="text-slate-500 italic">No major corrections found. Your responses were solid!</p>
          )}
        </div>
      </div>
    </div>
  );
};