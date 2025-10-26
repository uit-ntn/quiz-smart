import React, { useState, useEffect } from 'react';
import vocabularyService from '../services/vocabularyService';

const VocabularyDebugPage = () => {
  const [mainTopics, setMainTopics] = useState([]);
  const [subTopics, setSubTopics] = useState({});
  const [tests, setTests] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedMainTopic, setSelectedMainTopic] = useState('');
  const [selectedSubTopic, setSelectedSubTopic] = useState('');

  useEffect(() => {
    fetchMainTopics();
  }, []);

  const fetchMainTopics = async () => {
    try {
      setLoading(true);
      const response = await vocabularyService.getAllVocabularyMainTopics();
      console.log('Main Topics Response:', response);
      setMainTopics(response || []);
    } catch (error) {
      console.error('Error fetching main topics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSubTopics = async (mainTopic) => {
    try {
      setLoading(true);
      const response = await vocabularyService.getVocabularySubTopicsByMainTopic(mainTopic);
      console.log(`Sub Topics for ${mainTopic}:`, response);
      setSubTopics(prev => ({ ...prev, [mainTopic]: response || [] }));
    } catch (error) {
      console.error(`Error fetching sub topics for ${mainTopic}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTests = async (mainTopic, subTopic) => {
    try {
      setLoading(true);
      const response = await vocabularyService.getVocabularyTestsByTopics(mainTopic, subTopic);
      console.log(`Tests for ${mainTopic}/${subTopic}:`, response);
      const key = `${mainTopic}/${subTopic}`;
      setTests(prev => ({ ...prev, [key]: response || [] }));
    } catch (error) {
      console.error(`Error fetching tests for ${mainTopic}/${subTopic}:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleMainTopicChange = (mainTopic) => {
    setSelectedMainTopic(mainTopic);
    setSelectedSubTopic('');
    if (mainTopic && !subTopics[mainTopic]) {
      fetchSubTopics(mainTopic);
    }
  };

  const handleSubTopicChange = (subTopic) => {
    setSelectedSubTopic(subTopic);
    if (selectedMainTopic && subTopic) {
      fetchTests(selectedMainTopic, subTopic);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold mb-6">Vocabulary Debug Page</h1>
          
          {loading && (
            <div className="text-blue-600 mb-4">Loading...</div>
          )}

          {/* Main Topics */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3">Main Topics ({mainTopics.length})</h2>
            <div className="bg-gray-100 p-4 rounded mb-4">
              <pre>{JSON.stringify(mainTopics, null, 2)}</pre>
            </div>
            <select 
              value={selectedMainTopic} 
              onChange={(e) => handleMainTopicChange(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Main Topic</option>
              {mainTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
          </div>

          {/* Sub Topics */}
          {selectedMainTopic && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                Sub Topics for "{selectedMainTopic}" ({subTopics[selectedMainTopic]?.length || 0})
              </h2>
              <div className="bg-gray-100 p-4 rounded mb-4">
                <pre>{JSON.stringify(subTopics[selectedMainTopic] || [], null, 2)}</pre>
              </div>
              <select 
                value={selectedSubTopic} 
                onChange={(e) => handleSubTopicChange(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="">Select Sub Topic</option>
                {(subTopics[selectedMainTopic] || []).map(subTopic => (
                  <option key={subTopic} value={subTopic}>{subTopic}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tests */}
          {selectedMainTopic && selectedSubTopic && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">
                Tests for "{selectedMainTopic}/{selectedSubTopic}" 
                ({tests[`${selectedMainTopic}/${selectedSubTopic}`]?.length || 0})
              </h2>
              <div className="bg-gray-100 p-4 rounded">
                <pre>{JSON.stringify(tests[`${selectedMainTopic}/${selectedSubTopic}`] || [], null, 2)}</pre>
              </div>
            </div>
          )}

          {/* URL Test */}
          {selectedMainTopic && selectedSubTopic && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">URL Test</h2>
              <div className="bg-blue-50 p-4 rounded">
                <p><strong>Expected URL:</strong></p>
                <code>/vocabulary/tests/{encodeURIComponent(selectedMainTopic)}/{encodeURIComponent(selectedSubTopic)}</code>
                <br /><br />
                <p><strong>Actual URL:</strong></p>
                <code>/vocabulary/tests/{selectedMainTopic}/{selectedSubTopic}</code>
                <br /><br />
                <a 
                  href={`/vocabulary/tests/${encodeURIComponent(selectedMainTopic)}/${encodeURIComponent(selectedSubTopic)}`}
                  className="inline-block px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Test Navigation
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VocabularyDebugPage;