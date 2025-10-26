// Base API URL (ensure your backend route prefix matches)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Helper to include auth header when available
const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
    };
};

const MultipleChoiceService = {
    // =========================
    // 📘 Get all multiple choice questions
    // =========================
    getAllMultipleChoices: async (filters = {}) => {
        try {
            const qs = new URLSearchParams(filters).toString();
            const url = qs ? `${API_BASE_URL}/multiple-choices?${qs}` : `${API_BASE_URL}/multiple-choices`;
            const response = await fetch(url, { method: 'GET', headers: getAuthHeaders() });
            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                throw new Error(`Failed to fetch questions: ${response.status} ${txt}`);
            }
            const data = await response.json().catch(() => ({}));
            // Controller returns { message, count, questions }
            return data.questions || data;
        } catch (error) {
            console.error('Error fetching questions:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get questions by Test ID
    // (Uses dedicated backend endpoint if available)
    // =========================
    getQuestionsByTestId: async (testId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/multiple-choices/test/${testId}`, { method: 'GET', headers: getAuthHeaders() });
            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                throw new Error(`Failed to fetch questions by test ID: ${response.status} ${txt}`);
            }
            const data = await response.json().catch(() => ({}));
            return data.questions || data;
        } catch (error) {
            console.error('Error fetching by test ID:', error);

            // fallback: client-side filter (if backend endpoint not available)
            try {
                const all = await MultipleChoiceService.getAllMultipleChoices();
                if (!Array.isArray(all)) return [];
                return all.filter(q =>
                    String(q.test_id) === String(testId) ||
                    String(q.testId) === String(testId) ||
                    (q.test && (String(q.test.id) === String(testId) || String(q.test._id) === String(testId)))
                );
            } catch {
                return [];
            }
        }
    },

    // =========================
    // 📘 Get question by ID
    // =========================
    getQuestionById: async (questionId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/multiple-choices/${questionId}`, { method: 'GET', headers: getAuthHeaders() });
            if (!response.ok) {
                const txt = await response.text().catch(() => '');
                throw new Error(`Failed to fetch question: ${response.status} ${txt}`);
            }
            const data = await response.json().catch(() => ({}));
            return data.question || data;
        } catch (error) {
            console.error('Error fetching question:', error);
            throw error;
        }
    },

    // =========================
    // 🟢 Create new multiple choice question
    // =========================
    createMultipleChoice: async (questionData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/multiple-choices`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(questionData),
            });
            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`Failed to create question: ${response.status} ${errText}`);
            }
            const data = await response.json().catch(() => ({}));
            return data.question || data;
        } catch (error) {
            console.error('Error creating question:', error);
            throw error;
        }
    },

    // =========================
    // 🟡 Update multiple choice question
    // =========================
    updateMultipleChoice: async (id, updateData) => {
        try {
            const response = await fetch(`${API_BASE_URL}/multiple-choices/${id}`, {
                method: 'PUT', // backend uses PUT
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData),
            });
            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`Failed to update question: ${response.status} ${errText}`);
            }
            const data = await response.json().catch(() => ({}));
            return data.question || data;
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    },

    // =========================
    // 🔴 Delete multiple choice question
    // =========================
    deleteMultipleChoice: async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/multiple-choices/${id}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
            });
            if (!response.ok) {
                const errText = await response.text().catch(() => '');
                throw new Error(`Failed to delete question: ${response.status} ${errText}`);
            }

            // Safe parse
            const data = await response.json().catch(() => ({}));
            return data.question || data || { success: true };
        } catch (error) {
            console.error('Error deleting question:', error);
            throw error;
        }
    },

    // =========================
    // 📘 Get test info by Test ID (constructed from questions data)
    // =========================
    getTestById: async (testId) => {
        try {
            // First get all questions for this test
            const questions = await MultipleChoiceService.getQuestionsByTestId(testId);
            
            if (!questions || questions.length === 0) {
                throw new Error('Không tìm thấy câu hỏi nào cho bài kiểm tra này');
            }
            
            // Extract test info from questions data
            const firstQuestion = questions[0];
            
            // Calculate time limit: 2 minutes per question, minimum 10 minutes
            const timeLimit = Math.max(questions.length * 2, 10);
            
            return {
                _id: testId,
                test_id: testId,
                test_title: `${firstQuestion.main_topic} - ${firstQuestion.sub_topic}`,
                main_topic: firstQuestion.main_topic,
                sub_topic: firstQuestion.sub_topic,
                total_questions: questions.length,
                time_limit_minutes: timeLimit,
                difficulty: firstQuestion.difficulty || 'medium',
                description: `Bài kiểm tra trắc nghiệm về ${firstQuestion.sub_topic}`,
                status: 'active',
                created_at: new Date(),
                updated_at: new Date()
            };
        } catch (error) {
            console.error('Error getting test by ID:', error);
            throw error;
        }
    },
};

export default MultipleChoiceService;

// Multiple Choice Schema Reference
/*
{
  _id: ObjectId,
  test_id: ObjectId,               // ref: tests
  question_text: String,
  options: [
    { label: "A", text: String },
    { label: "B", text: String },
    { label: "C", text: String },
    { label: "D", text: String }
  ],
  correct_answers: [String],       // ["B"] hoặc ["A","C"]
  explanation: {
    correct: String,
    incorrect_choices: {           // {"A": "...", "C": "..."}
      label: String
    }
  },
  difficulty: String,              // "easy" | "medium" | "hard"
  tags: [String],
  status: String,                  // "active" | "draft" | "archived"
  created_by: ObjectId,
  updated_by: ObjectId,
  created_at: Date,
  updated_at: Date
}

*/