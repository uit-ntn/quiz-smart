const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const GrammarService = {
    // Get all grammar questions
    getAllGrammars:  async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/grammars`);
            if (!response.ok) throw new Error('Failed to fetch grammar questions');
            return await response.json();
        } catch (error) {
            console.error('Error fetching grammar questions:', error);
            throw error;
        }
    },

    // Get grammar question by ID
    getGrammarById: async (questionId) => {
        try {
            const response = await fetch(`${API_BASE_URL}/grammars/${questionId}`);
            if (!response.ok) throw new Error('Failed to fetch grammar question');
            return await response.json();
        } catch (error) {
            console.error('Error fetching grammar question:', error);
            throw error;
        }
    },
};

export default GrammarService;
