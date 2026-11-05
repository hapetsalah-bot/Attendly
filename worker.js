export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // 1. Student Login Endpoint
      if (url.pathname === "/api/login" && request.method === "POST") {
        const { phone, password, grade_id } = await request.json();
        const stmt = env.DB.prepare(
          "SELECT * FROM students WHERE phone = ? AND password_hash = ? AND grade_id = ?"
        );
        const student = await stmt.bind(phone, password, grade_id).first();

        if (!student) {
          return new Response(JSON.stringify({ success: false, message: "Invalid credentials or grade" }), {
            status: 401,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        return new Response(JSON.stringify({ success: true, student }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 2. Fetch Student Dashboard Data Endpoint
      if (url.pathname === "/api/student-data" && request.method === "GET") {
        const studentId = url.searchParams.get("student_id");
        const student = await env.DB.prepare("SELECT * FROM students WHERE id = ?").bind(studentId).first();
        const sessions = await env.DB.prepare("SELECT * FROM sessions WHERE grade_id = ?").bind(student?.grade_id).all();
        const attendance = await env.DB.prepare("SELECT * FROM attendance WHERE student_id = ?").bind(studentId).all();
        const assignments = await env.DB.prepare("SELECT * FROM assignments WHERE student_id = ?").bind(studentId).all();
        const quizzes = await env.DB.prepare("SELECT * FROM quizzes WHERE student_id = ?").bind(studentId).all();

        return new Response(JSON.stringify({
          success: true,
          student,
          sessions: sessions.results,
          attendance: attendance.results,
          assignments: assignments.results,
          quizzes: quizzes.results
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      // 3. QR Attendance Scan Endpoint (Prevents duplicate scans per session)
      if (url.pathname === "/api/scan" && request.method === "POST") {
        const { student_id, session_id } = await request.json();
        
        // Check if already scanned
        const existing = await env.DB.prepare(
          "SELECT * FROM attendance WHERE student_id = ? AND session_id = ?"
        ).bind(student_id, session_id).first();

        if (existing) {
          return new Response(JSON.stringify({ success: false, message: "Duplicate scan: Attendance already recorded for this session." }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }

        await env.DB.prepare(
          "INSERT INTO attendance (student_id, session_id, status) VALUES (?, ?, 'Present')"
        ).bind(student_id, session_id).run();

        return new Response(JSON.stringify({ success: true, message: "Attendance recorded successfully!" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }

      return new Response("Attendly Classroom API Active", { headers: corsHeaders });
    } catch (err) {
      return new Response(JSON.stringify({ success: false, error: err.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
  }
};