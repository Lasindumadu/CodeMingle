const handleDemoLogin = async (accountType) => {
    setError('')
    setValidationErrors({})
    setLoading(true)
    
    try {
      const data = await AuthService.demoLogin(accountType)
      const role = data.role || AuthService.getRole()
      
      // Show success message briefly
      setError('')
      
      // Check if there's a stored redirect URL
      const redirectUrl = localStorage.getItem('redirectAfterLogin')
      if (redirectUrl) {
        localStorage.removeItem('redirectAfterLogin')
        navigate(redirectUrl)
      } else {
        // Default redirect to dashboard
        navigate('/dashboard')
      }
    } catch (err) {
      const errorMessage = err?.response?.data?.message || 
                          err?.message || 
                          'Demo login failed. Please try again.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }
