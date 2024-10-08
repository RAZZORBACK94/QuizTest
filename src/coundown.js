import React, { useEffect, useRef, useState } from 'react'

export default function Coundown({seconds, endFunction}) {

    const formatTime = (time) => {
        let minutes = Math.floor(time / 60)
        let seconds = Math.floor(time - minutes * 60)

        if(minutes < 10 ) minutes = '0' + minutes;
        if(seconds < 10 ) seconds = '0' + seconds;

        return minutes + ' : ' + seconds
    }

    const [countdown, setCountdown] = useState(seconds)
    const timerId = useRef()

    useEffect(() => {
        timerId.current = setInterval(async () => {
            await setCountdown(prev => prev-1)
        }, 1000);
        return () => clearInterval(timerId.current)
    },[])

    useEffect(() => {
        localStorage.setItem("time" ,countdown)
        if (countdown <= 0) {
            clearInterval(timerId.current)
            endFunction()
        }
    },[countdown])

  return (
    <div className='p-2 bg-violet-500 w-max m-auto rounded-xl'>
        <p className='text-4xl font-semibold text-white'>{formatTime(countdown)}</p>
    </div>
  )
}
