import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ChevronDownIcon, CheckCircleIcon, ExclamationTriangleIcon, LightBulbIcon, SparklesIcon, AdjustmentsHorizontalIcon, KeyIcon } from '@heroicons/react/24/outline';
import { apiHelpers } from '../services/api';
import aiService from '../services/aiService';
import AILoader from './annimations/AILoader';
import { useAuth } from '../contexts/AuthContext';

const ATSSummary = ({ atsAnalysis, isGenerating = false, isNewAnalysis = false, resume = null, resumeId = null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingType, setProcessingType] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(0);
  const [isTokenExhausted, setIsTokenExhausted] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Get initial token balance
  useEffect(() => {
    if(!user.isOwnApiKey) {
      const balance = apiHelpers.getTokenBalance();
      setTokenBalance(balance);
      setIsTokenExhausted( balance <= 0);
    }
  }, [user.isOwnApiKey]);

  // Listen for token balance updates
  useEffect(() => {
    const handleTokenBalanceUpdate = (event) => {
      const { balance } = event.detail;
      setTokenBalance(balance);
      setIsTokenExhausted(balance <= 0);
    };

    window.addEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
    return () => window.removeEventListener('tokenBalanceUpdated', handleTokenBalanceUpdate);
  }, []);

  // Update token balance from user data if available
  useEffect(() => {
    if (user && user.tokens !== undefined) {
      setTokenBalance(user.tokens);
      setIsTokenExhausted(user.tokens <= 0);
    }
  }, [user]);


  // Auto-open when new analysis is available
  useEffect(() => {
    if (atsAnalysis && atsAnalysis.overall_score !== null && isNewAnalysis) {
      setIsOpen(true);
    }
  }, [atsAnalysis, isNewAnalysis]);

  if (!atsAnalysis || atsAnalysis.overall_score === null) {
    return null;
  }

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 60) return 'text-lime-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return 'Excellent Match!';
    if (score >= 60) return 'Good Match';
    if (score >= 40) return 'Fair Match';
    return 'Needs Improvement';
  };

  const getScoreDescription = (score) => {
    if (score >= 80) return 'Your resume shows excellent alignment with the job requirements.';
    if (score >= 60) return 'Your resume shows good alignment with the job requirements with some areas for improvement.';
    if (score >= 40) return 'Your resume shows moderate alignment with the job requirements. Consider addressing the identified gaps.';
    return 'Your resume needs significant improvements to better match the job requirements.';
  };

  const getCategoryWidth = (score, maxScore) => {
    return Math.min((score / maxScore) * 100, 100);
  };


  // Handle Adjust Tone action
  const handleAdjustTone = async () => {
    if (!resume || !resumeId) {
      toast.error('Resume data not available');
      return;
    }

    if (!user.isOwnApiKey && (isTokenExhausted || tokenBalance <= 0)) {
      toast.error('AI tokens exhausted! Please purchase more tokens to continue using AI features.');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingType('adjust-tone');
      
      const response = await aiService.adjustTone(resumeId, resume, atsAnalysis, ["summary", "experience", "projects"]);
      
      if (response.success) {
        // Update token balance after successful operation
        const currentBalance = apiHelpers.getTokenBalance();
        const newBalance = Math.max(0, currentBalance - 1);
        apiHelpers.updateTokenBalance(newBalance);
        
        // Store the AI-enhanced data in localStorage with a flag
        const aiEnhancedData = {
          ...response.data,
          _aiEnhanced: true,
          _enhancementType: 'adjust-tone',
          _timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('ai_enhanced_resume_data', JSON.stringify(aiEnhancedData));
        
        // Navigate to edit page
        navigate('/resume-form', { 
          state: { 
            resumeId, 
            editMode: true,
            fromAIEnhancement: true
          } 
        });
      } else {
        throw new Error(response.error || 'Failed to adjust tone');
      }
    } catch (error) {
      console.error('Adjust tone error:', error);
      toast.error(apiHelpers.formatError(error));
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  // Handle Enhance Keywords action
  const handleEnhanceKeywords = async () => {
    if (!resume || !resumeId) {
      toast.error('Resume data not available');
      return;
    }

    if (!user.isOwnApiKey && (isTokenExhausted || tokenBalance <= 0)) {
      toast.error('AI tokens exhausted! Please purchase more tokens to continue using AI features.');
      return;
    }

    try {
      setIsProcessing(true);
      setProcessingType('enhance-keywords');
      
      const response = await aiService.enhanceKeywords(resumeId, resume, atsAnalysis, ["skills", "experience", "projects"]);
      
      if (response.success) {
        // Update token balance after successful operation
        const currentBalance = apiHelpers.getTokenBalance();
        const newBalance = Math.max(0, currentBalance - 1);
        apiHelpers.updateTokenBalance(newBalance);
        
        // Store the AI-enhanced data in localStorage with a flag
        const aiEnhancedData = {
          ...response.data,
          _aiEnhanced: true,
          _enhancementType: 'enhance-keywords',
          _timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('ai_enhanced_resume_data', JSON.stringify(aiEnhancedData));
        
        // Navigate to edit page
        navigate('/resume-form', { 
          state: { 
            resumeId, 
            editMode: true,
            fromAIEnhancement: true
          } 
        });
      } else {
        throw new Error(response.error || 'Failed to enhance keywords');
      }
    } catch (error) {
      console.error('Enhance keywords error:', error);
      toast.error(apiHelpers.formatError(error));
    } finally {
      setIsProcessing(false);
      setProcessingType(null);
    }
  };

  return (
    <div className="bg-white dark:bg-orange-50/90 rounded-lg border border-gray-200 dark:border-orange-200/40 shadow-sm group">
      <details 
        open={isOpen}
        onToggle={(e) => setIsOpen(e.target.open)}
        className="group"
      >
        <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
          <div className="flex items-center gap-4">
            <div className="relative">
              <svg className="h-12 w-12" height="120" viewBox="0 0 120 120" width="120">
                <circle 
                  className="text-gray-300" 
                  cx="60" 
                  cy="60" 
                  fill="transparent" 
                  r="52" 
                  stroke="currentColor" 
                  strokeWidth="8"
                />
                <circle 
                  className={`${getScoreColor(atsAnalysis.overall_score)} progress-ring__circle`}
                  cx="60" 
                  cy="60" 
                  fill="transparent" 
                  r="52" 
                  stroke="currentColor" 
                  strokeDasharray="326.72" 
                  strokeLinecap="round" 
                  strokeWidth="8" 
                  style={{
                    strokeDashoffset: `calc(326.72 - (326.72 * ${atsAnalysis.overall_score}) / 100)`
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-bold text-gray-900">{atsAnalysis.overall_score}</span>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-2">
                ATS Score Breakdown
                <SparklesIcon className="w-5 h-5 text-purple-500" />
              </h3>
              <p className={`text-sm font-semibold ${getScoreColor(atsAnalysis.overall_score)}`}>
                {getScoreLabel(atsAnalysis.overall_score)}
              </p>
            </div>
          </div>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-600 transition-transform duration-200 ${
              isOpen ? 'rotate-180' : ''
            }`} 
          />
        </summary>

        <div className="px-4 pb-4 space-y-6">
          {/* Overall Score */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-indigo-700 font-bold text-lg mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              Overall Score
            </h4>
            <p className="text-gray-600 text-sm leading-relaxed">
              Your resume scored <span className="font-semibold text-indigo-600">{atsAnalysis.overall_score}</span> out of 100. {getScoreDescription(atsAnalysis.overall_score)}
            </p>
          </div>

          {/* Category Scores */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-emerald-700 font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              Category Scores
            </h4>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="w-1/3 text-gray-700 font-medium text-xs sm:text-sm">Skills Match</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getCategoryWidth(atsAnalysis.category_scores.keyword_skill_match, 40)}%` }}
                  />
                </div>
                <span className="text-gray-700 text-xs w-12 text-right">
                  {atsAnalysis.category_scores.keyword_skill_match}/40
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="w-1/3 text-gray-700 font-medium text-xs sm:text-sm">Experience</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getCategoryWidth(atsAnalysis.category_scores.experience_alignment, 20)}%` }}
                  />
                </div>
                <span className="text-gray-700 text-xs w-12 text-right">
                  {atsAnalysis.category_scores.experience_alignment}/20
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="w-1/3 text-gray-700 font-medium text-xs sm:text-sm">Completeness</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getCategoryWidth(atsAnalysis.category_scores.section_completeness, 15)}%` }}
                  />
                </div>
                <span className="text-gray-700 text-xs w-12 text-right">
                  {atsAnalysis.category_scores.section_completeness}/15
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="w-1/3 text-gray-700 font-medium text-xs sm:text-sm">Projects</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getCategoryWidth(atsAnalysis.category_scores.project_impact, 10)}%` }}
                  />
                </div>
                <span className="text-gray-700 text-xs w-12 text-right">
                  {atsAnalysis.category_scores.project_impact}/10
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="w-1/3 text-gray-700 font-medium text-xs sm:text-sm">Formatting</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getCategoryWidth(atsAnalysis.category_scores.formatting, 10)}%` }}
                  />
                </div>
                <span className="text-gray-700 text-xs w-12 text-right">
                  {atsAnalysis.category_scores.formatting}/10
                </span>
              </div>
              
              <div className="flex items-center gap-2 sm:gap-4">
                <span className="w-1/3 text-gray-700 font-medium text-xs sm:text-sm">Bonus Skills</span>
                <div className="w-2/3 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-teal-500 h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${getCategoryWidth(atsAnalysis.category_scores.bonus_skills, 5)}%` }}
                  />
                </div>
                <span className="text-gray-700 text-xs w-12 text-right">
                  {atsAnalysis.category_scores.bonus_skills}/5
                </span>
              </div>
            </div>
          </div>

          {/* Missing Keywords */}
          {atsAnalysis.missing_keywords && atsAnalysis.missing_keywords.length > 0 && (
            <div className="border-t border-gray-200 pt-4">
              <h4 className="text-amber-700 font-bold text-lg mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Missing Keywords
              </h4>
              <div className="flex flex-wrap gap-2">
                {(showAllKeywords ? atsAnalysis.missing_keywords : atsAnalysis.missing_keywords.slice(0, 10)).map((keyword, index) => (
                  <span 
                    key={index}
                    className="bg-amber-50 text-amber-800 text-xs font-medium px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    {keyword}
                  </span>
                ))}
                {atsAnalysis.missing_keywords.length > 10 && !showAllKeywords && (
                  <button
                    onClick={() => setShowAllKeywords(true)}
                    className="bg-blue-100 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full border border-blue-200 hover:bg-blue-200 transition-colors cursor-pointer"
                  >
                    +{atsAnalysis.missing_keywords.length - 10} more
                  </button>
                )}
                {showAllKeywords && atsAnalysis.missing_keywords.length > 10 && (
                  <button
                    onClick={() => setShowAllKeywords(false)}
                    className="bg-gray-100 text-gray-600 text-xs font-medium px-2.5 py-1 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors cursor-pointer"
                  >
                    Show less
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Strengths and Weaknesses */}
          <div className="border-t border-gray-200 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-green-700 font-bold text-lg mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Strengths
              </h4>
              <ul className="space-y-2">
                {atsAnalysis.strengths && atsAnalysis.strengths.length > 0 ? (
                  atsAnalysis.strengths.slice(0, 3).map((strength, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <CheckCircleIcon className="text-green-500 text-base mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">{strength}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-sm">
                    <CheckCircleIcon className="text-green-500 text-base mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-gray-700">No specific strengths identified</span>
                  </li>
                )}
              </ul>
            </div>
            
            <div>
              <h4 className="text-red-700 font-bold text-lg mb-3 flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                Weaknesses
              </h4>
              <ul className="space-y-2">
                {atsAnalysis.weaknesses && atsAnalysis.weaknesses.length > 0 ? (
                  atsAnalysis.weaknesses.slice(0, 3).map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <ExclamationTriangleIcon className="text-yellow-500 text-base mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">{weakness}</span>
                    </li>
                  ))
                ) : (
                  <li className="flex items-start gap-2 text-sm">
                    <ExclamationTriangleIcon className="text-yellow-500 text-base mt-0.5 h-4 w-4 flex-shrink-0" />
                    <span className="text-gray-700">No specific weaknesses identified</span>
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* ATS Warnings & Recommendations */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-purple-700 font-bold text-lg mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
              ATS Warnings & Recommendations
            </h4>
            <ul className="space-y-3">
              {atsAnalysis.ats_warnings && atsAnalysis.ats_warnings.length > 0 && (
                <>
                  {atsAnalysis.ats_warnings.slice(0, 2).map((warning, index) => (
                    <li key={`warning-${index}`} className="flex items-start gap-2 text-sm">
                      <ExclamationTriangleIcon className="text-orange-500 text-base mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">{warning}</span>
                    </li>
                  ))}
                </>
              )}
              {atsAnalysis.recommendations && atsAnalysis.recommendations.length > 0 && (
                <>
                  {atsAnalysis.recommendations.slice(0, 3).map((recommendation, index) => (
                    <li key={`rec-${index}`} className="flex items-start gap-2 text-sm">
                      <LightBulbIcon className="text-orange-500 text-base mt-0.5 h-4 w-4 flex-shrink-0" />
                      <span className="text-gray-700">{recommendation}</span>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* AI Action Buttons */}
          <div className="border-t border-gray-200 pt-4">
            <h4 className="text-indigo-700 font-bold text-lg mb-4 flex items-center gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
              AI-Powered Improvements
            </h4>
            
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAdjustTone}
                disabled={isProcessing || isTokenExhausted}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isTokenExhausted 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white cursor-not-allowed opacity-75' 
                    : 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isTokenExhausted ? 'AI tokens exhausted - Buy more tokens to continue' : ''}
              >
                <AdjustmentsHorizontalIcon className="w-4 h-4" />
                {isTokenExhausted ? 'Tokens Exhausted' : 'Adjust Tone'}
                <SparklesIcon className="w-3 h-3 text-yellow-300" />
              </button>
              <button
                onClick={handleEnhanceKeywords}
                disabled={isProcessing || isTokenExhausted}
                className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isTokenExhausted 
                    ? 'bg-gradient-to-r from-red-500 to-red-600 text-white cursor-not-allowed opacity-75' 
                    : 'bg-gradient-to-r from-purple-500 to-purple-600 text-white hover:from-purple-600 hover:to-purple-700'
                } ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={isTokenExhausted ? 'AI tokens exhausted - Buy more tokens to continue' : ''}
              >
                <KeyIcon className="w-4 h-4" />
                {isTokenExhausted ? 'Tokens Exhausted' : 'Enhance Keywords'}
                <SparklesIcon className="w-3 h-3 text-yellow-300" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              {isTokenExhausted ? (
                <>
                  <span className='text-red-500'>⚠️</span>AI tokens exhausted! 
                  <Link to="/payment" className="text-blue-500 hover:text-blue-700 underline ml-1">
                    Buy more tokens
                  </Link> to continue using AI features.
                </>
              ) : (
                'AI will analyze your resume and make targeted improvements'
              )}
            </p>
          </div>
        </div>
      </details>

      {/* ATS Loader Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-orange-50/90 rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
            <AILoader 
              title={processingType === 'adjust-tone' ? 'Adjusting Resume Tone...' : 'Enhancing Keywords...'}
              subtitle={processingType === 'adjust-tone' 
                ? 'Our AI is analyzing your resume and adjusting the tone to better match the job requirements.'
                : 'Our AI is identifying and integrating relevant keywords to improve your ATS score.'
              }
              showProgress={true}
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .progress-ring__circle {
          transition: stroke-dashoffset 0.5s;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
      `}</style>
    </div>
  );
};

export default ATSSummary;
