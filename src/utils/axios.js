"use client"

import axios from "axios";

// const api = axios.create({
//   baseURL: "https://devapi.dequity.technology", 
//   headers: {
//     CountryShortName:"in",
//     "parentSid":"846b1f9ec0ffc7ff678171edcd9e52f17b8d0d3450340bad1073a6d1caeb75aec7a42d1421379c0bc895822bd2b088dcbad9db1c5bb75cca3deaaf8befecfb74",
//     "Authorization":"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbmNyeXB0ZWRQYXlsb2FkIjoiOGZlM2YwNTkwMzg0OTE3ZjhjZDkxM2JkYWQ3MGU5NzUxYmE3ZjViZTFkNzgzZTUxYmI3ZmU2MjA5MTY0YWVjNjcyZDI1MWViNzEzZDEzZDJkYjY5ZjgxMDFhOGQxNjY5N2M0MjNmYTY0M2ZjODAyZGExMTBlOGVjMmE2YTRlYTM0ZTdiOTE1NzQ1ZjdjZDYxYjI2YTYyMjVmZmVlMmI5NCIsImlhdCI6MTc1NjkwMjM1MywiZXhwIjoxNzU2OTA1OTUzfQ.N6XZW9JE-rInGA3zojCcEMvuxIs3mkNc4AZSQSdeE33UD6L1cvglG2xYbOSR-E3jp0kh2VUu_SoPHLQDJG4tvA1L8hGKRCBr5geQnlOrxcXlqex8aCweXn-MiASBQeRXiukrfMXp3jkInZUkrZTVaJGHruHLh-9r5RGJuXNgePwjKZfWiD-ud1tp16W_ICn3Tcw3AhPocRkgbbEUuQCfPjyymwOavKXRNhWnTfYQOF1pyVOw4T-7Q7Y21FvUqpGq5RNMm4PoXrjKxRav2C-P01EX4KRAzPY5Yd_nsd6S9HvzBT-vZCzkos08vBnv7fHuu953KcmNmXRp8YHMiNO1hg",
//     "masterProfileId":"6729c3e8dacc0c1a90b33439",
//     "keyIdentifier":"DO",
//     "accept-language": "en",
//   },
// });



// export default api

const userApi = axios.create({
  baseURL: "http://localhost:3000/singup",
   headers: {
    "Content-Type": "application/json", 
  },
})

export default userApi
