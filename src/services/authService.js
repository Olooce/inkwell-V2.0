import apiClient from './apiClient'
import { userStore } from '@/stores/userStore'

export const authService = {
    async login(credentials) {
        try {
            const response = await apiClient.post('/auth/login/', credentials)
            const { access, refresh, user } = response.data

           console.log(user);
            userStore.setUser(user);

            if (access) {
                const token = `Bearer ${access}`
                localStorage.setItem('user-token', token)
                localStorage.setItem('refresh-token', refresh)

                // // Fetch complete user info including assessment status
                await this.fetchUserInfo()

                return response.data
            }
            throw new Error('Login failed - no access token received')
        } catch (error) {
            console.error('Login error:', error.response?.data || error)
            throw new Error(error.response?.data?.detail || 'Login failed')
        }
    },

    async fetchUserInfo() {
        try {
            const response = await apiClient.get('/auth/userInformation/')
              console.log(response)
            // Parse and extract initial assessment status correctly
            const userData = {
                email: response.data.email,
                first_name: response.data.first_name || '',
                last_name: response.data.last_name || '',
                initial_assessment_completed: response.data.initial_assessment_completed === true
            }

            console.log('Fetched user data:', userData) // Debug log

            localStorage.setItem('user-data', JSON.stringify(userData))
            userStore.setUser(userData)

            return userData
        } catch (error) {
            console.error('Error fetching user info:', error)
            // Load from localStorage as fallback
            const storedData = localStorage.getItem('user-data')
            if (storedData) {
                const userData = JSON.parse(storedData)
                userStore.setUser(userData)
                return userData
            }
            return null
        }
    },

    async register(userData) {
        try {
          console.log({
            email: userData.email,
            username: userData.email.split('@')[0],
            password: userData.password,
            first_name: userData.first_name,
            last_name: userData.last_name
          });

          const response = await apiClient.post('/auth/register/', {
                email: userData.email,
                username: userData.email.split('@')[0],
                password: userData.password,
                first_name: userData.first_name,
                last_name: userData.last_name
            })


            return response.data
        } catch (error) {
          const errorData = error.response?.data || {};
          let errorMessage = 'Registration failed';

          if (errorData.email && errorData.email.length) {
            errorMessage = errorData.email[0];
          } else if (errorData.username && errorData.username.length) {
            errorMessage = errorData.username[0];
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          }

          throw new Error(errorMessage);
        }
    },

    logout() {
        userStore.clearUser()
        localStorage.removeItem('user-token')
        localStorage.removeItem('refresh-token')
        localStorage.removeItem('user-data')
    },

    getToken() {
        return localStorage.getItem('user-token')
    },

    isAuthenticated() {
        const token = this.getToken()
        return token && token.startsWith('Bearer ')
    },

    isAssessmentCompleted() {
        try {
            const userData = localStorage.getItem('user-data')
            if (!userData) return false
            const parsed = JSON.parse(userData)
            return parsed.initial_assessment_completed === true
        } catch (error) {
            console.error('Error checking assessment status:', error)
            return false
        }
    }
}
