import { useEffect, useState, useRef } from "react";
import api from "../utils/axios";

export default function useServerTimer(onExpire) {
  const [timeLeft, setTimeLeft] = useState(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const initTimer = async () => {
      try {
        const res = await api.get("/attempt/time");

        const serverTime = res.data.timeLeft;

        console.log("⏱ Initial Time:", serverTime);

        if (serverTime <= 0) return; // prevent start

        setTimeLeft(serverTime);

        intervalRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(intervalRef.current);
              onExpire && onExpire();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);

      } catch (err) {
        console.error("Timer error:", err);
      }
    };

    initTimer();

    return () => clearInterval(intervalRef.current);
  }, []);

  return timeLeft;
}