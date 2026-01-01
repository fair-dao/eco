// Common functions for API calls and authentication

class ForumAPI {
    constructor() {
        this.apiBaseUrl = 'http://localhost:5233/api';
        this.token = localStorage.getItem('forumToken');
        this.currentUser = JSON.parse(localStorage.getItem('forumUser'));
    }

    setToken(token) {
        this.token = token;
        localStorage.setItem('forumToken', token);
    }

    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem('forumUser', JSON.stringify(user));
    }

    logout() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('forumToken');
        localStorage.removeItem('forumUser');
    }

    isAuthenticated() {
        return !!this.token;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Generic fetch with authorization
    async fetch(endpoint, options = {}) {
        const url = `${this.apiBaseUrl}${endpoint}`;
        
        const headers = {
            'Content-Type': 'application/json',
            ...options.headers
        };

        if (this.token) {
            headers['Authorization'] = `Bearer ${this.token}`;
        }

        const config = {
            ...options,
            headers
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.Error || `API error: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Auth endpoints
    async login(walletAddress, signature, message) {
        const data = {
            walletAddress,
            signature,
            message
        };

        const response = await this.fetch('/Auth/login', {
            method: 'POST',
            body: JSON.stringify(data)
        });

        if (response.token) {
            this.setToken(response.token);
            this.setCurrentUser(response.user);
        }

        return response;
    }

    // Posts endpoints
    async getPosts(category = null, page = 1, pageSize = 10) {
        let endpoint = `/Posts?page=${page}&pageSize=${pageSize}`;
        if (category) {
            endpoint += `&category=${encodeURIComponent(category)}`;
        }
        return await this.fetch(endpoint);
    }

    async getPost(id) {
        return await this.fetch(`/Posts/${id}`);
    }

    async createPost(title, content, category) {
        const data = {
            title,
            content,
            category
        };

        return await this.fetch('/Posts', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updatePost(id, title, content, category) {
        const data = {
            title,
            content,
            category
        };

        return await this.fetch(`/Posts/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deletePost(id) {
        return await this.fetch(`/Posts/${id}`, {
            method: 'DELETE'
        });
    }

    // Comments endpoints
    async getCommentsByPost(postId) {
        return await this.fetch(`/Comments/Post/${postId}`);
    }

    async createComment(postId, content) {
        const data = {
            content
        };

        return await this.fetch(`/Comments?postId=${postId}`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateComment(id, content) {
        const data = {
            content
        };

        return await this.fetch(`/Comments/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteComment(id) {
        return await this.fetch(`/Comments/${id}`, {
            method: 'DELETE'
        });
    }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ForumAPI;
} else {
    window.ForumAPI = ForumAPI;
}

// Utility functions
window.utils = {
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    },

    truncateText(text, maxLength = 100) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    },

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#28a745';
                break;
            case 'error':
                notification.style.backgroundColor = '#dc3545';
                break;
            case 'warning':
                notification.style.backgroundColor = '#ffc107';
                notification.style.color = '#212529';
                break;
            default:
                notification.style.backgroundColor = '#17a2b8';
        }

        // Add to DOM
        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Animate out and remove
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    },

    validateForm(formData, requiredFields) {
        for (const field of requiredFields) {
            if (!formData[field] || formData[field].trim() === '') {
                throw new Error(`请填写${field}`);
            }
        }
        return true;
    }
};