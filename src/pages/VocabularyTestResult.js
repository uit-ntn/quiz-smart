import React, { useEffect, useState } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import VocabularyLayout from '../layout/VocabularyLayout';
import testResultService from '../services/testResultService';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const VocabularyTestResult = () => {
  const { testId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { answers = [], settings = {}, testInfo = {}, draftResultId = null } = location.state || {};
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [testResultId, setTestResultId] = useState(draftResultId);
  const [isSaved, setIsSaved] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Calculate statistics
  const totalQuestions = answers.length;
  const correctAnswers = answers.filter(answer => answer.isCorrect).length;
  const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
  const wrongAnswers = totalQuestions - correctAnswers;

  useEffect(() => {
    // If we don't have a draft result ID but have answers, create draft
    if (answers.length > 0 && user && !draftResultId && !testResultId) {
      saveDraftResult();
    }
  }, [answers, user, draftResultId]);

  const saveDraftResult = async () => {
    if (!user) {
      console.error('User not logged in');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Prepare answers data for BE
      const formattedAnswers = answers.map((answer, index) => ({
        question_id: answer.question._id,
        collection: 'vocabularies',
        question_text: settings.mode === 'word_to_meaning' 
          ? `Từ: ${answer.question.word}` 
          : settings.mode === 'meaning_to_word'
          ? `Nghĩa: ${answer.question.meaning}`
          : `Nghe và viết: ${answer.question.word}`,
        correct_answer: settings.mode === 'word_to_meaning' 
          ? answer.question.meaning 
          : answer.question.word,
        user_answer: answer.userAnswer || '',
        is_correct: answer.isCorrect
      }));

      const resultData = {
        test_id: testId,
        total_questions: totalQuestions,
        correct_count: correctAnswers,
        percentage: percentage,
        duration_ms: answers.reduce((total, answer) => total + (answer.timeSpent * 1000), 0),
        start_time: new Date(Date.now() - answers.reduce((total, answer) => total + (answer.timeSpent * 1000), 0)),
        end_time: new Date(),
        answers: formattedAnswers
      };

      const result = await testResultService.createTestResult(resultData);
      setTestResultId(result._id);
      
      // Save to localStorage as backup
      localStorage.setItem(`vocab_result_${testId}`, JSON.stringify({
        ...resultData,
        resultId: result._id,
        testInfo,
        settings
      }));

    } catch (err) {
      console.error('Error saving draft result:', err);
      setError('Có lỗi xảy ra khi lưu kết quả tạm thời.');
    } finally {
      setLoading(false);
    }
  };

  const saveResult = async () => {
    if (!testResultId && !draftResultId) {
      setError('Không tìm thấy kết quả để lưu.');
      return;
    }

    const resultId = testResultId || draftResultId;

    try {
      setLoading(true);
      setError(null);

      await testResultService.updateTestResultStatus(resultId, 'active');
      setIsSaved(true);
      setTestResultId(resultId); // Update state

      // Update localStorage
      const savedData = JSON.parse(localStorage.getItem(`vocab_result_${testId}`) || '{}');
      localStorage.setItem(`vocab_result_${testId}`, JSON.stringify({
        ...savedData,
        status: 'active',
        saved: true
      }));

    } catch (err) {
      console.error('Error saving result:', err);
      setError('Có lỗi xảy ra khi lưu kết quả.');
    } finally {
      setLoading(false);
    }
  };

  const playAudio = (text) => {
    if (isPlaying || !text) return;
    
    setIsPlaying(true);
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Set voice based on settings
    if (settings.voiceMode === 'fixed' && settings.selectedVoice) {
      const voices = speechSynthesis.getVoices();
      const selectedVoice = voices.find(voice => 
        voice.name.includes(settings.selectedVoice) || 
        voice.voiceURI.includes(settings.selectedVoice)
      );
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
    }
    
    utterance.onend = () => setIsPlaying(false);
    speechSynthesis.speak(utterance);
  };

  if (!answers.length) {
    return (
      <VocabularyLayout>
        <ErrorMessage 
          error="Không tìm thấy kết quả bài test." 
          onRetry={() => navigate(-1)} 
        />
      </VocabularyLayout>
    );
  }

  const getScoreColor = (percentage) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 80) return 'bg-green-50 border-green-200';
    if (percentage >= 60) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  return (
    <VocabularyLayout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Kết quả bài test</h1>
          <p className="text-gray-600">{testInfo?.test_title || 'Bài test từ vựng'}</p>
        </div>

        {/* Score Overview */}
        <div className={`rounded-xl border-2 p-8 mb-8 ${getScoreBg(percentage)}`}>
          <div className="text-center">
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
              {percentage}%
            </div>
            <div className="text-xl text-gray-700 mb-6">
              Bạn đã trả lời đúng {correctAnswers}/{totalQuestions} câu
            </div>
            
            <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{totalQuestions}</div>
                <div className="text-sm text-gray-600">Tổng câu</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{correctAnswers}</div>
                <div className="text-sm text-gray-600">Đúng</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{wrongAnswers}</div>
                <div className="text-sm text-gray-600">Sai</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center space-x-4 mt-8">
              <button
                onClick={() => navigate(-2)}
                className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Quay lại danh sách
              </button>
              
              {!isSaved && (
                <button
                  onClick={saveResult}
                  disabled={loading}
                  className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 font-medium"
                >
                  {loading ? 'Đang lưu...' : '💾 Lưu kết quả'}
                </button>
              )}

              {isSaved && (
                <div className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium">
                  ✅ Đã lưu kết quả
                </div>
              )}
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-100 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Detailed Results */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Chi tiết từng câu</h2>
          
          <div className="space-y-4">
            {answers.map((answer, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border-2 ${
                  answer.isCorrect 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      answer.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">
                        {settings.mode === 'word_to_meaning' && `Từ: ${answer.question.word}`}
                        {settings.mode === 'meaning_to_word' && `Nghĩa: ${answer.question.meaning}`}
                        {settings.mode === 'listen_and_type' && `Nghe và viết từ`}
                      </div>
                      
                      {/* Audio buttons */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => playAudio(answer.question.word)}
                          disabled={isPlaying}
                          className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 disabled:opacity-50"
                        >
                          🔊 Nghe từ
                        </button>
                        {answer.question.example_sentence && (
                          <button
                            onClick={() => playAudio(answer.question.example_sentence)}
                            disabled={isPlaying}
                            className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200 disabled:opacity-50"
                          >
                            🔊 Nghe câu
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className={`font-bold ${
                    answer.isCorrect ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {answer.isCorrect ? '✓ Đúng' : '✗ Sai'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Câu trả lời của bạn:</span>
                    <div className={`mt-1 p-2 rounded ${
                      answer.isCorrect ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {answer.userAnswer || <em className="text-gray-500">(Không trả lời)</em>}
                    </div>
                  </div>
                  
                  {!answer.isCorrect && (
                    <div>
                      <span className="font-medium text-gray-600">Đáp án đúng:</span>
                      <div className="mt-1 p-2 bg-green-100 rounded">
                        {settings.mode === 'word_to_meaning' ? answer.question.meaning : answer.question.word}
                      </div>
                    </div>
                  )}
                </div>

                {answer.question.example_sentence && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <span className="font-medium text-gray-600 text-sm">Câu ví dụ:</span>
                    <div className="mt-1 text-sm text-gray-700 italic">
                      "{answer.question.example_sentence}"
                    </div>
                  </div>
                )}

                <div className="mt-2 text-xs text-gray-500">
                  Thời gian: {answer.timeSpent}s
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-center space-x-4 mt-8">
          <button
            onClick={() => navigate(`/vocabulary/test/${testId}/settings`)}
            className="px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            🔄 Làm lại bài test
          </button>
          
          <button
            onClick={() => navigate('/vocabulary')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            📚 Về danh sách từ vựng
          </button>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <LoadingSpinner message="Đang xử lý..." />
        </div>
      )}
    </VocabularyLayout>
  );
};

export default VocabularyTestResult;