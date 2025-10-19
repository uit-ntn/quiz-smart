// Base API URL (ensure your backend route prefix matches)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const MultipleChoiceService = {
    // =========================
    // 📘 Get all multiple choice questions
    // =========================
    getAllMultipleChoices: async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/multiple-choices`);
            if (!response.ok) throw new Error('Failed to fetch questions');
            return await response.json();
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
            const response = await fetch(`${API_BASE_URL}/multiple-choices/test/${testId}`);
            if (!response.ok) throw new Error('Failed to fetch questions by test ID');
            return await response.json();
        } catch (error) {
            console.error('Error fetching by test ID:', error);

            // fallback: client-side filter (if backend endpoint not available)
            try {
                const all = await MultipleChoiceService.getAllMultipleChoices();
                if (!Array.isArray(all)) return [];
                return all.filter(q =>
                    q.test_id === testId ||
                    q.testId === testId ||
                    (q.test && (q.test.id === testId || q.test._id === testId))
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
            const response = await fetch(`${API_BASE_URL}/multiple-choices/${questionId}`);
            if (!response.ok) throw new Error('Failed to fetch question');
            return await response.json();
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
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}` // uncomment if using JWT
                },
                body: JSON.stringify(questionData),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed to create question: ${errText}`);
            }
            return await response.json();
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
                headers: {
                    'Content-Type': 'application/json',
                    // 'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(updateData),
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed to update question: ${errText}`);
            }
            return await response.json();
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
                // headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(`Failed to delete question: ${errText}`);
            }

            // Handle empty or non-JSON responses safely
            try {
                return await response.json();
            } catch {
                return { success: true };
            }
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
