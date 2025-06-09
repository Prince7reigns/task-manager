import React from 'react'
import { useNavigate } from 'react-router-dom'
import { ToastContainer,toast } from 'react-toastify'
import { BACK_BUTTON, DANGER_BTN, FULL_BUTTON, INPUT_WRAPPER, personalFields, SECTION_WRAPPER, securityFields } from '../assets/dummy'
import { ChevronLeft, LogOut, Save, Shield, UserCircle } from 'lucide-react'
import axios from 'axios'

const API_URL = 'http://localhost:4000'


const Profile = ({setCurrentUser,onLogout}) => {

    const [profile, setProfile] = React.useState({name: '', email: '',})
    const [password, setPassword] = React.useState({current:"", new: "", confirm: ""})
    const Navigate = useNavigate()

    useEffect(() => {
        const accessToken = localStorage.getItem('accessToken')

        if (!accessToken) return
        axios.get(`${API_URL}/api/v1/users/me`, {
            headers: {
                Authorization: `${accessToken}`
            }
        }).then(({data}) =>{
            if(data.success){
                setProfile({name: data.user.name, email: data.user.email})
            }else{
                toast.error(data.message || "Failed to fetch profile data")
            }
        }).catch((error) => {
            console.error("Error fetching profile data:", error)
            toast.error(error.response?.data?.message || "An error occurred while fetching profile data")
        })

    },[profile])

    const saveProfile = async (e) => {
        e.preventDefault()
        try {
            const accessToken = localStorage.getItem('accessToken')
            if (!accessToken) {
                toast.error("You must be logged in to update your profile")
                return
            }

            const data = await axios.put(`${API_URL}/api/v1/users/profile`,
                 {name: profile.name, email: profile.email},
                 {headers: {Authorization: `${accessToken}`}})
            
            if (data.data.success) {
                setCurrentUser(prev => ({...prev, name: profile.name,
                 avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=random`
                }))
                
                toast.success("Profile updated successfully!")
            }else {
                toast.error(data.data.message || "Failed to update profile")
            }
        } catch (error) {
            console.error("Error saving profile:", error)
            toast.error(error.response?.data?.message || "An error occurred while saving profile data")
        }
    }

    const changePassword = async (e) =>{
        e.preventDefault()
        if(password.new !== password.confirm){{
            
            return toast.error("New password and confirmation do not match")
        }

        try {
            const accessToken = localStorage.getItem('accessToken')
            const data = await axios.put(`${API_URL}/api/v1/users/password`,
                {currentPassword: password.current, newPassword: password.new},
                {headers: {Authorization: `${accessToken}`}}
            )
            if (data.data.success) {
                toast.success("Password changed successfully!")
                setPassword({current: "", new: "", confirm: ""})
            }else{
                toast.error(data.data.message || "Failed to change password")
            }
        } catch (error) {
            console.error("Error changing password:", error)
            toast.error(error.response?.data?.message || "An error occurred while changing password")
        }
    }
  return (
    <div className='min-h-screen bg-gray-50'>
      <ToastContainer position='top-center' autoClose={3000}  />
      <div className='max-w-4xl mx-auto p-6'>
        <button onClick={ () => Navigate(-1)} className={BACK_BUTTON}>
            <ChevronLeft className='h-5 w-5 mr-1' />
            Back to Dashboard
        </button>
        <div className='flex items-center gap-4 mb-8'>
            <div className='w-16 h-16 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center text-white shadow-md font-bold text-2xl'>
                {profile.name ? profile.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
                <h1 className='text-3xl font-bold text-gray-800'>Account Setting</h1>
                <p className='text-sm text-gray-500'>Manage your account settings and preferences</p>
            </div>
        </div>
        <div className='grid md:grid-cols-2 gap-8'>
            <section className={SECTION_WRAPPER}>
               <div className='flex items-center gap-2 mb-6'>
                   <UserCircle className='text-purple-500 w-5 h-5'/>
                     <h2 className='text-xl font-semibold text-gray-800'>Profile Information</h2>
               </div>

               {/* Profile information form can be used to update user profile details */}
               <form onSubmit={saveProfile} className='space-y-4'>
                  {personalFields.map(({name,type,placeholder,icon:Icon}) => (
                    <div key={name} className={INPUT_WRAPPER}>
                        <Icon className='text-purple-500 w-5 h-5' />
                        <input
                            type={type}
                            name={name}
                            value={profile[name] }
                            onChange={(e) => setProfile({...profile, [name]: e.target.value})}
                            placeholder={placeholder}
                            className='w-full focus:outline-none text-sm' required/>
                    </div>
                  ))}
                  <button className={FULL_BUTTON} type='submit'>
                    <Save className='w-4 h-4' /> save changes
                  </button>
               </form>
            </section>

            <section className={SECTION_WRAPPER}>
                <div className='flex items-center gap-2 mb-6'>
                     <Shield className='text-purple-500 w-5 h-5'/>
                     <h2 className='text-xl font-semibold text-gray-600'>Security</h2>
                </div>

                <form onSubmit={changePassword} className='space-y-4'>
                    {securityFields.map(({name,placeholder}) => (
                        <div key={name} className={INPUT_WRAPPER}>
                            <input
                                type="password"
                                name={name}
                                placeholder={placeholder}
                                value={password[name]}
                                onChange={(e) => setPassword({...password, [name]: e.target.value})}
                                className='w-full focus:outline-none text-sm' required/>
                        </div>
                    ))}
                    <button className={FULL_BUTTON} type='submit'>
                        <Shield className='w-4 h-4' /> Change Password
                    </button>

                    <div className='mt-8 pt-6 border-t border-gray-100'>
                       <h3 className='text-red-600 font-semibold mb-4 flex text-center gap-2'>
                        <LogOut className='w-5 h-5' /> Danger Zone
                       </h3>
                       <button className={DANGER_BTN} onClick={onLogout} >
                         Logout 
                       </button>
                    </div>
                </form>
            </section>
        </div>
      </div>
    </div>
  )
}
}

export default Profile
