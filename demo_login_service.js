async demoLogin(accountType) {
    const res = await axios.post(`${API_BASE}/auth/demo-login`, { accountType })
    const { token, role, username } = res.data
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(ROLE_KEY, role || 'USER')
    localStorage.setItem(USERNAME_KEY, username || accountType)
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
    return res.data
  };
