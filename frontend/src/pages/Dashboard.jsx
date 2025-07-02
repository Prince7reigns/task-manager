import React,{useCallback, useMemo, useState} from 'react'
import { ADD_BUTTON, HEADER, ICON_WRAPPER, STAT_CARD, STATS_GRID, VALUE_CLASS, WRAPPER,STATS, LABEL_CLASS, FILTER_WRAPPER, FILTER_LABELS, SELECT_CLASSES, TABS_WRAPPER, FILTER_OPTIONS, TAB_BASE, TAB_ACTIVE, TAB_INACTIVE, EMPTY_STATE } from '../assets/dummy'
import { CalendarIcon, Filter, HomeIcon,Plus } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import TaskItem from '../components/TaskItem'
import axios from 'axios'
import TaskModel from '../components/TaskModel'

const API_URL = 'http://localhost:4000'

const Dashboard = () => {

    const {tasks, refreshTasks} = useOutletContext() 
    const [showModel,setShowModel] = useState(false)
    const [selectedTask, setSelectedTask] = useState(null)
    const [filter, setFilter] = useState('all')

    const stats = useMemo(()=>({
      total: tasks.length,
       lowPriority: tasks.filter(task => task.priority?.toLowerCase() === 'low').length,
       mediumPriority: tasks.filter(task => task.priority?.toLowerCase() === 'medium').length,
       highPriority: tasks.filter(task => task.priority?.toLowerCase() === 'high').length,
         completed: tasks.filter(task => task.completed=== true || task.completed === 1 || (
              typeof task.completed === 'string' && task.completed.toLowerCase() === "yes"
         ).length)
    }), [tasks])

    const filteredTasks = useMemo(() => tasks.filter(task => {
        const dueData = new Date(task.dueDate)
        const today = new Date()
        const nextWeek = new Date(today); nextWeek.setDate(today.getDate() + 7)
        switch (filter) {
            case 'today':
                return dueData.toDateString() === today.toDateString();
                case "week" :
                return dueData >= today && dueData <= nextWeek;
                case 'high':
                case 'medium':
                case 'low':
                    return task.priority?.toLowerCase() === filter;
                default:
                return true; // For 'all' or any other filter
        }
    }), [tasks, filter]);

    const handeTaskSave = useCallback(async (taskData)=>{
        try {
            if(taskData.id) await axios.put(`${API_URL}/gp/${taskData.id}`, taskData)
            refreshTasks()
          setShowModel(false)
          setSelectedTask(null)
        } catch (error) {
            console.error("Error saving tasks",error)
        }

    },[refreshTasks])
  return (
    <div className={WRAPPER}>
      <div className={HEADER}>
         <div className='min-w-0'>
            <h1 className='text-xl md:text-3xl font-bold text-gray-800 flex items-center gap-2'>
               <HomeIcon className='w-5 h-5 text-purple-500 md:w-6 md:h-6 shrink-0' />
               <span className='truncate'>Task Overview</span>
            </h1>
            <p className='text-sm text-gray-500 mt-1 ml-7 truncate'>Manage Your tasks efficiently</p>
         </div>
          <button className={ADD_BUTTON} onClick={() => setShowModel(true)}>
            <Plus size={18}/>
            Add New Task
          </button>
      </div>
      {/* STATS */}
      <div className={STATS_GRID}>
        {STATS.map(({key,label,icon:Icon,iconColor,borderColor='border-purple-100',valueKey ,textColor,gradient})  => (
           <div key={key}  className={`${STAT_CARD} ${borderColor}`}>
              <div className='flex items-center gap-2 md:gap-3'>
                 <div className={`${ICON_WRAPPER } ${iconColor}`}>
                    <Icon className='w-5 h-5 md:w-6 md:h-6' />
                 </div>

                 <div className='min-w-0'>
                   <p className={`${VALUE_CLASS} ${gradient ? "bg-gradient-to-r from-purple-500 to-fuchsia-600 bg-clip-text text-transparent" : textColor}`}>
                      {stats[valueKey]}
                   </p>
                   <p className={LABEL_CLASS}>{label}</p>
                 </div>
              </div>
           </div>
        ))}
      </div>
      {/* CONTENT */}
      <div className='space-y-6'>
            <div className={FILTER_WRAPPER}>
               <div className='flex items-center gap-2 min-w-0'>
                 <Filter className='w-5 h-5 text-purple-500 shrink-0' />
                    <h2 className='text-base md:text-lg font-semibold text-gray-800 truncate'>
                        {FILTER_LABELS[filter] }
                    </h2>
               </div>
               <select value={filter} onChange={(e)=> setFilter(e.target.value)} className={SELECT_CLASSES}>
                {Object.keys(FILTER_LABELS).map(opt => (
                    <option key={opt} value={opt}>
                      {FILTER_LABELS[opt]}
                    </option>
                   ))}
               </select>

               <div className={TABS_WRAPPER}>
                 {FILTER_OPTIONS.map(opt => (
                     <button
                        key={opt}
                        className={`${TAB_BASE} ${filter === opt ? TAB_ACTIVE : TAB_INACTIVE}`}>
                           {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </button>
                 ))}
               </div>
            </div>

            <div className='space-y-4'>
                {filteredTasks.length === 0 ? (
                    <div className={EMPTY_STATE.wrapper}>
                     <CalendarIcon className='w-8 h-8 text-purple-500'/>
                     <h3 className='text-lg font-semibold text-gray-800 mb-2'>
                        No tasks found for this filter
                     </h3>
                        <p className='text-sm text-gray-500'>
                            {filter === 'all' ? 'Create a new task to get started.' : `No tasks found for this filter.`}
                        </p>

                        <button onClick={() => setShowModel(true)} className={EMPTY_STATE.btn}> 
                          Add New Task
                        </button>
                    </div>
                ):(
                    filteredTasks.map(task => (
                        <TaskItem key ={task._id || task.id} task={task} 
                          onRefresh={refreshTasks}
                          showCompleteCheckbox
                          onEdit = {()=>{setSelectedTask(task); setShowModel(true)}}
                        />))
                )}
            </div>
            <div
             onClick={()=> setShowModel(true)}
            className='hidden md:flex items-center justify-center p-4 border-2 border-dashed border-purple-200 rounded-xl hover:border-purple-400 bg-purple-50/50 cursor-pointer transition-colors'>
              <Plus className='w-5 h-5 text-purple-500 mr-2'/>
              <span className='text-gray-600 font-semibold'>Add New Task</span>
            </div>
      </div>
      <TaskModel isOpen={showModel || !!selectedTask} 
        onClose={()=> {setShowModel(false); setSelectedTask(null)}}
        taskToEdit={selectedTask}
        onSave={handeTaskSave}
      />
    </div>
  )
}

export default Dashboard
