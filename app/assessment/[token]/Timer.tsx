'use client'

import { useEffect, useState } from "react";

export default function Timer({
  expiresAt
}: {
  expiresAt: number
}) {

  const [remaining, setRemaining] = useState(
    expiresAt - Date.now()
  );


  useEffect(() => {

    const interval = setInterval(() => {

      setRemaining(
        expiresAt - Date.now()
      );

    }, 1000);


    return () => clearInterval(interval);

  }, [expiresAt]);


  if (remaining <= 0) {

    return (
      <div>
        Time expired. Submitting...
      </div>
    )

  }


  const minutes = Math.floor(
    remaining / 60000
  );

  const seconds = Math.floor(
    (remaining % 60000) / 1000
  );


  return (
    <h2>
      Time Remaining:
      {" "}
      {minutes}:{seconds.toString().padStart(2, "0")}
    </h2>
  )

}