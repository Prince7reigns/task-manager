import { UserPlus } from 'lucide-react'
import React from 'react'
import {BUTTONCLASSES, FIELDS, Inputwrapper} from '../assets/dummy'
import {MESSAGE_SUCCESS} from '../assets/dummy'
import {MESSAGE_ERROR} from '../assets/dummy'
import axios from 'axios'

const API_URL = 'http://localhost:4000'
const INITIAL_FROM ={
  fullName: '',
  username: '',
  email: '',
  password: '',
}


const SignUp = ({onSwitchMode}) => {

  const [formData, setFormData] = React.useState(INITIAL_FROM)
  const [loading, setLoading] = React.useState(false)
  const [message, setMessage] = React.useState({text:"", type:""})

  const handleSubmit= async(e) =>{
    e.preventDefault()
    setLoading(true)
    setMessage({text:"", type:""})
    
    try {
      const {data} = await axios.post(`${API_URL}/api/v1/users/register`, formData)
      console.log("signup successfull data", data);
      setMessage({text: "Registration successful! Please log in.", type: "success"})
      setFormData(INITIAL_FROM)
    } catch (error) {
      console.error("Error during signup:", error);
      const errorMessage = error.response?.data?.message || "An error occurred during registration.";
      setMessage({text: errorMessage, type: "error"})
    }finally{
      setLoading(false)
    }
    
  }
  return (
    <div className='max-w-md w-full bg-white shadow-lg border border-purple-200 rounded-xl p-8'>
      <div className='text-center mb-6'>
        <div className='w-16 h-16 bg-gradient-to-br from-fuchsia-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center'>
            <UserPlus className='w-8 h-8 text-white ' />    
        </div>
        <h2 className='text-2xl font-bold text-gray-800'>Create an Account</h2>
        <p className='text-gray-500 text-sm mt-1'>Join us to manage your tasks efficiently</p>
      </div>
      {message.text && (
        <div className={message.type === 'success' ? MESSAGE_SUCCESS : MESSAGE_ERROR}>
          {message.text}
        </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {FIELDS.map(({name, type, placeholder,icon:Icon} )=>(
            <div className={Inputwrapper} key={name}>
              <Icon className='text-purple-500 w-5 h-5 mr-2'/>

              <input 
                type={type}
                placeholder={placeholder}
                value={formData[name]}
                onChange={(e) => setFormData({...formData, [name]: e.target.value})}
                className='w-full text-sm focus:outline-none text-gray-700'
                required
              />
            </div>
          ))}
          <button 
            type='submit' 
            disabled={loading}
            className={BUTTONCLASSES}
          >
            {loading ? 'Creating Account...' : <><UserPlus className='w-4 h-4' />Sign Up</>}
          </button>
        </form>
        <p className='text-center text-sm text-gray-600'>
          Already have an account? {' '}
          <button 
            onClick={onSwitchMode}
            className='text-purple-600 hover:text-purple-600 hover:underline font-medium transition-colors duration-200'
          >
            Log In
          </button>
        </p>
    </div>
  )
}

export default SignUp
