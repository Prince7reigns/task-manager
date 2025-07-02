import { Lock, LogIn, Mail,Eye,EyeOff } from 'lucide-react'
import React, { useEffect } from 'react'
import { toast, ToastContainer } from 'react-toastify'
import { BUTTONCLASSES, INPUTWRAPPER} from '../assets/dummy'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const API_URL = 'http://localhost:4000'

const INITIAL_FROM ={
  email: '',
  password: '',
}

const Login = ({onSubmit,onSwitchMode}) => {

    const [showPassword, setShowPassword] = React.useState(false)
    const [rememberMe, setRememberMe] = React.useState(false)
    const [formData, setFormData] = React.useState(INITIAL_FROM)
    const [loading, setLoading] = React.useState(false)
     const navigate = useNavigate()

    const handleSubmit = async (e) => {
      e.preventDefault()
      
      if(!rememberMe){
        toast.error("you must anable remember me tp login")
        return
      }

      setLoading(true)      

      try {
        const {data} = (await axios.post(`${API_URL}/api/v1/users/login`, formData)).data
        

        if(!data?.accessToken){
          throw new Error( data.message || "Login failed, please try again")
        }
        
        localStorage.setItem('refreshToken', data.refreshToken)
        localStorage.setItem('accessToken', data.accessToken)

        localStorage.setItem("userId",data?.user?.id || "")
        setFormData(INITIAL_FROM)
        

        onSubmit?.({refreshToken: data.accessToken, accessToken: data.accessToken, userId: data.user.id, ...data.user})
        toast.success("Login successful!")
        console.log("Login successful, redirecting to home page...", data);
        
        setTimeout(() => {
          navigate('/',)
        }, 1000)
      } catch (error) {      
       console.error("Login error:", error)
        const errorMessage = error.response?.data?.message || "An error occurred during login."
        toast.error(errorMessage)
      }finally{
        setLoading(false)
      }
    }
  

    const handleSWitchMode = () => {
      toast.dismiss()
      onSwitchMode?.()
    }

    const fields=[
      {
        id:1,
        name: 'email',
        type: 'email',
        placeholder: 'Email Address',
        icon:Mail
      },
      {
        id:2,
        name: 'password',
        type: showPassword ? 'text' : 'password',
        placeholder: 'Password',
        icon:Lock,
        isPassword: true
      }
    ]

    useEffect(()=>{
      const accessToken = localStorage.getItem('accessToken')

      console.log("accessToken", accessToken);
      const userId = localStorage.getItem('userId')
      if(accessToken){
        (async () => {
          try {
            const {data} = await axios.get(`${API_URL}/api/v1/users/me`, {
              headers: {
                Authorization: `${accessToken}`
              }
            })
           
               if(data.success){
              onSubmit?.({
                accessToken,
                userId,
                ...data.user
            })
            navigate('/')
          }else{
            localStorage.clear()
          }
            } catch(error)  {
            console.error("Error fetching user data:", error)
            toast.error("Failed to fetch user data, please log in again")
            localStorage.clear()
          }
        })()
      }
    },[ onSubmit])
  return (
    <div className='max-w-md w-full bg-white shadow-lg border border-purple-100 rounded-xl p-8'>
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar/>
      <div className='text-center mb-6'>
        <div className='w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
            <LogIn className='w-8 h-8 text-white ' />
        </div>
        <h2 className='text-2xl font-bold text-gray-800'>Welcome Back!</h2>
        <p className='text-gray-500 text-sm mt-1'>Please log in to continue</p>
      </div>

      <form onSubmit={handleSubmit} className='space-y-4'>
        {fields.map(({id,name, type, placeholder, icon:Icon , isPassword}) => (
          <div className={INPUTWRAPPER} key={id}>
            <Icon className='text-purple-500 w-5 h-5' />
            <input
              type={type}
              placeholder={placeholder}
              value={formData[name]}
              onChange={(e) => setFormData({...formData, [name]: e.target.value})}
              className='w-full px-2 focus:outline-none text-sm text-gray-700'
              required
            />
            {isPassword &&(

              <div onClick={() => setShowPassword((prev) => !prev)} className=' text-gray-500 ml-2 hover:text-purple-500 transition-colors'>
                   
                {showPassword ? <EyeOff className='w-5 h-5' /> : <Eye className='w-5 h-5' />}

              </div>
              
            )}
          </div>
        ))}

        <div className='flex items-center'>
           <input type='checkbox'
            id='rememberMe'
            checked={rememberMe}
            onChange={()=>setRememberMe((prev) => !prev)} 
            className='h-4 w-4 text-purple-500 focus:ring-purple-400 border-gray-300 rounded'
            required
            />
            <label htmlFor='rememberMe' className='ml-2 block text-sm text-gray-700'>Remember Me</label>
        </div>
        <button
          type='submit'
          disabled={loading}
          className={BUTTONCLASSES}
        >
          {loading ? 'Logging In...' : <><LogIn className='w-4 h-4 ' />Log In</>}
          </button>
      </form>
      <p className='text-center text-sm text-gray-600 mt-6'>
          Don't have an account? {' '}
          <button 
            type='button'
            onClick={handleSWitchMode}
            className='text-purple-600 hover:text-purple-600 hover:underline font-medium transition-colors duration-200'
           
          >
            Sign Up
          </button>
      </p>
    </div>
  )
}

export default Login
