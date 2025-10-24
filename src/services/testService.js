// =========================
// 📘 TestService.js
// =========================

// Base URL: kiểm tra route prefix backend của bạn (nếu dùng /api thì giữ nguyên)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { 'Authorization': `Bearer ${token}` })
    };
};

const TestService = {
    // =========================
    // 🟢 Create a new test
    // =========================
    createTest: async (testData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(testData),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed to create test: ${errText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error creating test:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get all tests
    // =========================
    getAllTests: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests`);
            if (!response.ok) throw new Error('Failed to fetch tests');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tests:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get all Multiple Choice tests
    // =========================
    getAllMultipleChoicesTests: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/multiple-choices`);
            if (!response.ok) throw new Error('Failed to fetch multiple choice tests');
            return await response.json();
        } catch (error) {
            console.error('Error fetching multiple choice tests:', error);
            throw error;
        }
    },


    // ========================
    // 📘 Get all Multiple Choice Main Topic
    // =========================
    getAllMultipleChoiceMainTopics: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/multiple-choices/main-topics`);
            if (!response.ok) throw new Error('Failed to fetch multiple choice main topics');
            return await response.json();
        } catch (error) {
            console.error('Error fetching multiple choice main topics:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get all Multiple Choice Sub Topics by Main Topic
    // =========================
    getMultipleChoiceSubTopicsByMainTopic: async (mainTopic) => {
        try {   
            const response = await fetch(`${API_BASE_URL}/tests/multiple-choices/sub-topics/${encodeURIComponent(mainTopic)}`);
            if (!response.ok) throw new Error('Failed to fetch multiple choice sub topics');
            return await response.json();
        } catch (error) {
            console.error('Error fetching multiple choice sub topics:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get all Vocabulary tests
    // =========================
    getAllVocabulariesTests: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/vocabularies`);
            if (!response.ok) throw new Error('Failed to fetch vocabulary tests');
            return await response.json();
        } catch (error) {
            console.error('Error fetching vocabulary tests:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get all Vocabulary sub topic by main topic
    getVocabularySubTopicsByMainTopic: async (mainTopic) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/vocabularies/sub-topics/${encodeURIComponent(mainTopic)}`);
            if (!response.ok) throw new Error('Failed to fetch vocabulary sub topics');
            return await response.json();
        } catch (error) {
            console.error('Error fetching vocabulary sub topics:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get all Grammar tests
    // =========================
    getAllGrammarsTests: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/grammars`);
            if (!response.ok) throw new Error('Failed to fetch grammar tests');
            return await response.json();
        } catch (error) {
            console.error('Error fetching grammar tests:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get all Vocabulary tests
    // =========================
    getAllVocabulariesTests: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/vocabularies`);
            if (!response.ok) throw new Error('Failed to fetch vocabulary tests');
            return await response.json();
        } catch (error) {
            console.error('Error fetching vocabulary tests:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get test by ID
    // =========================
    getTestById: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/${id}`);
            if (!response.ok) throw new Error('Failed to fetch test by ID');
            return await response.json();
        } catch (error) {
            console.error('Error fetching test by ID:', error);
            throw error;
        }
    },

    // =========================
    // 🟡 Update test
    // =========================
    updateTest: async (id, updateData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed to update test: ${errText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error updating test:', error);
            throw error;
        }
    },

    // =========================
    // 🔴 Delete test
    // =========================
    deleteTest: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed to delete test: ${errText}`);
            }

            // handle possible empty body
            try {
                return await response.json();
            } catch {
                return { success: true };
            }
        } catch (error) {
            console.error('Error deleting test:', error);
            throw error;
        }
    },

    // =========================
    // 🔍 Search tests (by title, description, topic)
    // =========================
    searchTests: async (searchTerm) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/search?q=${encodeURIComponent(searchTerm)}`);
            if (!response.ok) throw new Error('Failed to search tests');
            return await response.json();
        } catch (error) {
            console.error('Error searching tests:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get tests by topic (main and sub)
    // =========================
    getTestsByTopic: async (mainTopic, subTopic = null) => {
        try {
            const url = subTopic
                ? `${API_BASE_URL}/tests/topic/${encodeURIComponent(mainTopic)}/${encodeURIComponent(subTopic)}`
                : `${API_BASE_URL}/tests/topic/${encodeURIComponent(mainTopic)}`;

            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch tests by topic');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tests by topic:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get tests by type (multiple_choice / grammar / vocabulary / ...)
    // =========================
    getTestsByType: async (testType) => {
        try {
            const response = await fetch(`${API_BASE_URL}/tests/type/${testType}`);
            if (!response.ok) throw new Error('Failed to fetch tests by type');
            return await response.json();
        } catch (error) {
            console.error('Error fetching tests by type:', error);
            throw error;
        }
    },
};

export default TestService;

// Test Schema Reference
/*
{
  _id: ObjectId,
  test_title: String,              // "TOEIC - Part 1 - Photos - Test 1"
  description: String,
  main_topic: String,              // "TOEIC", "IELTS", "AWS", ...
  sub_topic: String,               // "Part 1 - Photos", "Reading Passage 2", ...
  test_type: String,               // "multiple_choice" | "grammar" | "vocabulary" | "spelling" | "listening"
  total_questions: Number,
  time_limit_minutes: Number,      // optional
  difficulty: String,              // "easy" | "medium" | "hard"
  status: String,                  // "active" | "draft" | "archived"
  created_by: ObjectId,            // ref: users
  updated_by: ObjectId,            // ref: users
  created_at: Date,
  updated_at: Date
}
*/