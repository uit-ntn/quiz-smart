import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import CreateVocabularyWithAIModal from './CreateVocabularyWithAIModal';

const CreateVocabularyWithAIButton = ({ className = '' }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (!user) {
      localStorage.setItem('authReturnTo', window.location.pathname);
      navigate('/login', {
        state: {
          message: 'Vui lòng đăng nhập để tạo bài test từ vựng với AI.',
        },
      });
      return;
    }

    setShowModal(true);
  };

  const isSmallButton = className.includes('w-14 h-14');

  return (
    <>
      <button
        onClick={handleClick}
        className={`inline-flex items-center justify-center
          bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 
          text-white font-medium rounded-lg shadow-md 
          hover:shadow-lg transform hover:scale-105 
          transition-all duration-200 ${className} ${
            isSmallButton ? 'p-0' : 'px-4 py-2 text-sm'
          }`}
        title="Tạo bài test từ vựng với AI"
      >
        <svg
          className={isSmallButton ? "w-6 h-6" : "w-4 h-4 mr-2"}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
          />
        </svg>
        {!isSmallButton && 'Tạo với AI'}
      </button>

      <CreateVocabularyWithAIModal
        show={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default CreateVocabularyWithAIButton;