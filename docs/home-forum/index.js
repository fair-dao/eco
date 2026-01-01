class ForumModule {
    constructor() {
        this.isLoggedIn = false;
        this.currentUser = null;
        this.jwtToken = null;
        this.currentPage = 1;
        this.pageSize = 10;
        this.currentCategory = '';
        this.currentPostId = null;
        
        // Initialize API and Wallet Connector
        this.api = new ForumAPI();
        this.walletConnector = new TronWebConnector();
        
        // DOM elements
        this.loginSection = document.getElementById('loginSection');
        this.forumMain = document.getElementById('forumMain');
        this.connectWalletBtn = document.getElementById('connectWalletBtn');
        this.createPostBtn = document.getElementById('createPostBtn');
        this.postsList = document.getElementById('postsList');
        this.pagination = document.getElementById('pagination');
        this.categoryFilter = document.getElementById('categoryFilter');
        
        // Modals
        this.createPostModal = document.getElementById('createPostModal');
        this.createPostForm = document.getElementById('createPostForm');
        this.postDetailModal = document.getElementById('postDetailModal');
        this.closeButtons = document.querySelectorAll('.close');
        
        // Form elements
        this.postTitle = document.getElementById('postTitle');
        this.postContent = document.getElementById('postContent');
        this.postCategory = document.getElementById('postCategory');
        this.newComment = document.getElementById('newComment');
        this.submitCommentBtn = document.getElementById('submitCommentBtn');
        
        this.init();
    }
    
    async init() {
        // Initialize translations
        await this.loadTranslations();
        
        // Load user session if exists
        this.loadSession();
        
        // Initialize event listeners
        this.initEventListeners();
        
        // Initialize wallet connector
        this.initWalletConnector();
        
        // Load posts if logged in
        if (this.isLoggedIn) {
            await this.loadPosts();
        }
    }
    
    async loadTranslations() {
        const lang = window.lang || 'en';
        const response = await fetch(`./i18n/${lang}.json`);
        this.translations = await response.json();
        
        // Apply translations
        document.getElementById('forumTitle').textContent = this.translations.forumTitle;
        document.getElementById('loginTitle').textContent = this.translations.loginTitle;
        this.connectWalletBtn.textContent = this.translations.connectWallet;
        this.createPostBtn.textContent = this.translations.createPost;
        document.getElementById('createPostModalTitle').textContent = this.translations.createPost;
        document.querySelector('label[for="postTitle"]').textContent = this.translations.title;
        document.querySelector('label[for="postContent"]').textContent = this.translations.content;
        document.querySelector('label[for="postCategory"]').textContent = this.translations.category;
        document.querySelector('#createPostForm button[type="submit"]').textContent = this.translations.submit;
        this.submitCommentBtn.textContent = this.translations.submitComment;
    }
    
    initEventListeners() {
        // Wallet connection
        this.connectWalletBtn.addEventListener('click', () => this.connectWallet());
        
        // Create post
        this.createPostBtn.addEventListener('click', () => this.openCreatePostModal());
        this.createPostForm.addEventListener('submit', (e) => this.handleCreatePost(e));
        
        // Category filter
        this.categoryFilter.addEventListener('change', () => this.handleCategoryFilter());
        
        // Modal close buttons
        this.closeButtons.forEach(button => {
            button.addEventListener('click', () => this.closeModal());
        });
        
        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target === this.createPostModal || e.target === this.postDetailModal) {
                this.closeModal();
            }
        });
        
        // Comment submission
        this.submitCommentBtn.addEventListener('click', () => this.handleSubmitComment());
    }
    
    initWalletConnector() {
        // Wallet connection events
        this.walletConnector.on('connect', async (walletAddress) => {
            try {
                // Generate message for signing
                const message = `Login to Forum App at ${new Date().toISOString()}`;
                
                // Sign message
                const signature = await this.walletConnector.signMessage(message);
                
                // Login to API
                await this.authenticate(walletAddress, signature, message);
                
                utils.showNotification(this.translations.loginSuccess, 'success');
            } catch (error) {
                console.error('Login failed:', error);
                utils.showNotification(this.translations.loginFailed + ': ' + error.message, 'error');
            }
        });

        this.walletConnector.on('disconnect', () => {
            this.handleLogout();
        });

        this.walletConnector.on('error', (message) => {
            utils.showNotification(this.translations.walletError + ': ' + message, 'error');
        });
    }
    
    async connectWallet() {
        try {
            await this.walletConnector.connect();
        } catch (error) {
            console.error('Wallet connection error:', error);
            utils.showNotification(this.translations.connectionError + ': ' + error.message, 'error');
        }
    }
    
    async authenticate(walletAddress, signature, message) {
        try {
            const user = await this.api.login(walletAddress, signature, message);
            
            this.isLoggedIn = true;
            this.currentUser = user;
            this.jwtToken = this.api.getToken();
            
            // Save session
            this.saveSession();
            
            // Show forum main section
            this.showForumMain();
            
            // Load posts
            await this.loadPosts();
        } catch (error) {
            console.error('Authentication error:', error);
            throw error;
        }
    }
    
    handleLogout() {
        this.walletConnector.disconnect();
        this.api.logout();
        this.clearSession();
        this.loginSection.style.display = 'block';
        this.forumMain.style.display = 'none';
        utils.showNotification(this.translations.logoutSuccess, 'info');
    }
    
    showForumMain() {
        this.loginSection.style.display = 'none';
        this.forumMain.style.display = 'block';
    }
    
    openCreatePostModal() {
        this.createPostModal.style.display = 'block';
    }
    
    closeModal() {
        this.createPostModal.style.display = 'none';
        this.postDetailModal.style.display = 'none';
        this.createPostForm.reset();
        this.newComment.value = '';
        this.currentPostId = null;
    }
    
    async handleCreatePost(e) {
        e.preventDefault();
        
        try {
            const postData = {
                title: this.postTitle.value,
                content: this.postContent.value,
                category: this.postCategory.value
            };
            
            // Validate form
            utils.validateForm(postData, ['title', 'content', 'category']);
            
            await this.api.createPost(postData.title, postData.content, postData.category);
            
            utils.showNotification(this.translations.postCreated, 'success');
            this.closeModal();
            await this.loadPosts();
        } catch (error) {
            console.error('Create post error:', error);
            utils.showNotification(this.translations.postCreationFailed + ': ' + error.message, 'error');
        }
    }
    
    async loadPosts() {
        try {
            this.showLoading();
            
            const response = await this.api.getPosts(this.currentCategory, this.currentPage, this.pageSize);
            const { Posts, Total, Page, PageSize, TotalPages } = response;
            
            this.renderPosts(Posts);
            this.renderPagination(Total, Page, PageSize);
        } catch (error) {
            console.error('Load posts error:', error);
            utils.showNotification(this.translations.loadPostsError + ': ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    renderPosts(posts) {
        this.postsList.innerHTML = '';
        
        if (posts.length === 0) {
            this.postsList.innerHTML = `<div class="no-posts">${this.translations.noPosts}</div>`;
            return;
        }
        
        posts.forEach(post => {
            const postCard = document.createElement('div');
            postCard.className = 'post-card';
            postCard.innerHTML = `
                <h3>${post.title}</h3>
                <div class="post-meta">
                    <span class="author">${this.translations.author}: ${post.author.username || post.author.walletAddress.slice(0, 6)}...</span>
                    <span class="date">${utils.formatDate(post.createdAt)}</span>
                    <span class="category">${post.category}</span>
                </div>
                <div class="post-preview">${utils.truncateText(post.content, 150)}</div>
                <div class="post-stats">
                    <span class="views">${post.views} ${this.translations.views}</span>
                    <span class="likes">${post.likes} ${this.translations.likes}</span>
                </div>
                <button class="btn-secondary view-post" data-post-id="${post.id}">${this.translations.viewPost}</button>
            `;
            
            this.postsList.appendChild(postCard);
        });
        
        // Add view post event listeners
        const viewButtons = document.querySelectorAll('.view-post');
        viewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const postId = e.target.dataset.postId;
                this.viewPost(postId);
            });
        });
    }
    
    async viewPost(postId) {
        try {
            this.showLoading();
            this.currentPostId = postId;
            
            const post = await this.api.getPost(postId);
            
            // Render post details
            this.renderPostDetails(post);
            
            // Load comments
            await this.loadComments(postId);
            
            // Show modal
            this.postDetailModal.style.display = 'block';
        } catch (error) {
            console.error('View post error:', error);
            utils.showNotification(this.translations.viewPostError + ': ' + error.message, 'error');
        } finally {
            this.hideLoading();
        }
    }
    
    renderPostDetails(post) {
        const postDetailContent = document.getElementById('postDetailContent');
        postDetailContent.innerHTML = `
            <h2>${post.title}</h2>
            <div class="post-meta">
                <span class="author">${this.translations.author}: ${post.author.username || post.author.walletAddress.slice(0, 6)}...</span>
                <span class="date">${utils.formatDate(post.createdAt)}</span>
                <span class="category">${post.category}</span>
            </div>
            <div class="post-content">${post.content}</div>
            <div class="post-stats">
                <span class="views">${post.views} ${this.translations.views}</span>
                <span class="likes">${post.likes} ${this.translations.likes}</span>
            </div>
        `;
    }
    
    async loadComments(postId) {
        try {
            const comments = await this.api.getCommentsByPost(postId);
            this.renderComments(comments);
        } catch (error) {
            console.error('Load comments error:', error);
            utils.showNotification(this.translations.loadCommentsError + ': ' + error.message, 'error');
        }
    }
    
    renderComments(comments) {
        const commentsSection = document.getElementById('commentsSection');
        commentsSection.innerHTML = `<h3>${this.translations.comments}</h3>`;
        
        if (comments.length === 0) {
            commentsSection.innerHTML += `<div class="no-comments">${this.translations.noComments}</div>`;
            return;
        }
        
        const commentsList = document.createElement('div');
        commentsList.className = 'comments-list';
        
        comments.forEach(comment => {
            const commentItem = document.createElement('div');
            commentItem.className = 'comment-item';
            commentItem.innerHTML = `
                <div class="comment-author">${comment.author.username || comment.author.walletAddress.slice(0, 6)}...</div>
                <div class="comment-date">${utils.formatDate(comment.createdAt)}</div>
                <div class="comment-content">${comment.content}</div>
            `;
            commentsList.appendChild(commentItem);
        });
        
        commentsSection.appendChild(commentsList);
    }
    
    async handleSubmitComment() {
        const commentContent = this.newComment.value.trim();
        if (!commentContent) {
            utils.showNotification(this.translations.emptyComment, 'warning');
            return;
        }
        
        const postId = this.currentPostId;
        if (!postId) return;
        
        try {
            await this.api.createComment(postId, commentContent);
            
            this.newComment.value = '';
            await this.loadComments(postId);
            utils.showNotification(this.translations.submitCommentSuccess, 'success');
        } catch (error) {
            console.error('Submit comment error:', error);
            utils.showNotification(this.translations.submitCommentError + ': ' + error.message, 'error');
        }
    }
    
    handleCategoryFilter() {
        this.currentCategory = this.categoryFilter.value;
        this.currentPage = 1;
        this.loadPosts();
    }
    
    renderPagination(total, currentPage, pageSize) {
        const totalPages = Math.ceil(total / pageSize);
        this.pagination.innerHTML = '';
        
        if (totalPages <= 1) return;
        
        // Previous button
        const prevButton = document.createElement('button');
        prevButton.className = 'page-btn';
        prevButton.textContent = this.translations.previous;
        prevButton.disabled = currentPage === 1;
        prevButton.addEventListener('click', () => {
            if (currentPage > 1) {
                this.currentPage--;
                this.loadPosts();
            }
        });
        this.pagination.appendChild(prevButton);
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = `page-btn ${i === currentPage ? 'active' : ''}`;
            pageButton.textContent = i;
            pageButton.addEventListener('click', () => {
                this.currentPage = i;
                this.loadPosts();
            });
            this.pagination.appendChild(pageButton);
        }
        
        // Next button
        const nextButton = document.createElement('button');
        nextButton.className = 'page-btn';
        nextButton.textContent = this.translations.next;
        nextButton.disabled = currentPage === totalPages;
        nextButton.addEventListener('click', () => {
            if (currentPage < totalPages) {
                this.currentPage++;
                this.loadPosts();
            }
        });
        this.pagination.appendChild(nextButton);
    }
    
    saveSession() {
        localStorage.setItem('forumSession', JSON.stringify({
            isLoggedIn: this.isLoggedIn,
            currentUser: this.currentUser,
            jwtToken: this.jwtToken
        }));
    }
    
    loadSession() {
        const session = localStorage.getItem('forumSession');
        if (session) {
            try {
                const { isLoggedIn, currentUser, jwtToken } = JSON.parse(session);
                this.isLoggedIn = isLoggedIn;
                this.currentUser = currentUser;
                this.jwtToken = jwtToken;
                
                // Set token in API
                if (jwtToken) {
                    this.api.setToken(jwtToken);
                }
                
                if (this.isLoggedIn) {
                    this.showForumMain();
                }
            } catch (error) {
                console.error('Load session error:', error);
                this.clearSession();
            }
        }
    }
    
    clearSession() {
        localStorage.removeItem('forumSession');
        this.isLoggedIn = false;
        this.currentUser = null;
        this.jwtToken = null;
        this.api.logout();
    }
    
    showLoading() {
        // Implement loading indicator
        this.postsList.innerHTML = '<div class="loading">' + this.translations.loading + '...</div>';
    }
    
    hideLoading() {
        // Remove loading indicator
    }
}

// Initialize forum module when page loads
window.addEventListener('load', () => {
    window.forumModule = new ForumModule();
});