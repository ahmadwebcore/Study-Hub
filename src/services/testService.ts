import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { TestItem, ResultRecord, TestQuestion, TestAttempt, TestAnswer } from '../types';
import { SAMPLE_TESTS, SAMPLE_RESULTS } from '../data/sampleData';

const CUSTOM_TESTS_KEY = 'studyhub_custom_tests_v2';

function getCustomTests(): TestItem[] {
  try {
    const raw = localStorage.getItem(CUSTOM_TESTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveCustomTests(tests: TestItem[]) {
  try {
    localStorage.setItem(CUSTOM_TESTS_KEY, JSON.stringify(tests));
  } catch {}
}

export const testService = {
  /**
   * Fetch all scheduled and completed tests with relation joins
   */
  async fetchTests(studentId?: string): Promise<TestItem[]> {
    if (!isSupabaseConfigured()) {
      const custom = getCustomTests();
      return [...custom, ...SAMPLE_TESTS];
    }

    try {
      let query = supabase
        .from('tests')
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          assigned_student:assigned_to(full_name),
          test_questions(id, marks),
          test_attempts(id, student_id, status, total_score, percentage, grade, passed)
        `)
        .order('date', { ascending: false });

      if (studentId) {
        query = query.or(`assigned_to.is.null,assigned_to.eq.${studentId}`);
      }

      const { data, error } = await query;
      if (error || !data || data.length === 0) {
        return SAMPLE_TESTS;
      }

      return data.map((item) => {
        const myAtt = studentId
          ? item.test_attempts?.find((a: { student_id: string }) => a.student_id === studentId)
          : null;

        return {
          id: item.id,
          title: item.title,
          subjectId: item.subject_id,
          subjectName: item.subjects?.name || '1st Year Intermediate',
          subjectCode: item.subjects?.code || 'FSC-PED-11',
          unitId: item.unit_id,
          unitTitle: item.units?.title,
          assignedTo: item.assigned_to,
          assignedStudentName: item.assigned_student?.full_name,
          date: new Date(item.date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          }),
          time: item.time,
          durationMinutes: item.duration_minutes,
          totalMarks: item.total_marks,
          passingMarks: item.passing_marks || Math.round(item.total_marks * 0.4),
          type: item.type,
          syllabusCoverage: item.syllabus_coverage,
          instructions: item.instructions,
          status: item.status,
          questionsCount: item.test_questions?.length || 0,
          studentScore: myAtt?.total_score,
          myAttempt: myAtt
            ? {
                id: myAtt.id,
                testId: item.id,
                studentId: myAtt.student_id,
                startedAt: '',
                status: myAtt.status,
                totalScore: myAtt.total_score,
                percentage: myAtt.percentage,
                grade: myAtt.grade,
                passed: myAtt.passed,
              }
            : undefined,
        };
      });
    } catch {
      return SAMPLE_TESTS;
    }
  },

  /**
   * Fetch single test with full questions and options
   */
  async fetchTestById(testId: string, studentId?: string): Promise<TestItem | null> {
    if (!isSupabaseConfigured()) {
      return SAMPLE_TESTS.find((t) => t.id === testId) || SAMPLE_TESTS[0];
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .select(`
          *,
          subjects:subject_id(name, code),
          units:unit_id(title),
          test_questions(
            id,
            test_id,
            question_text,
            question_type,
            marks,
            question_order,
            attachment_url,
            explanation,
            test_options(id, question_id, option_text, is_correct, sort_order)
          ),
          test_attempts(
            id,
            student_id,
            started_at,
            submitted_at,
            status,
            total_score,
            percentage,
            grade,
            passed,
            feedback,
            test_answers(id, question_id, selected_option_id, text_answer, file_url, is_flagged_for_review, marks_awarded, feedback)
          )
        `)
        .eq('id', testId)
        .single();

      if (error || !data) {
        return SAMPLE_TESTS.find((t) => t.id === testId) || null;
      }

      const myAtt = studentId
        ? data.test_attempts?.find((a: { student_id: string }) => a.student_id === studentId)
        : null;

      const questions: TestQuestion[] = (data.test_questions || [])
        .sort((a: { question_order: number }, b: { question_order: number }) => a.question_order - b.question_order)
        .map((q: {
          id: string;
          test_id: string;
          question_text: string;
          question_type: 'mcq' | 'short_answer' | 'long_answer' | 'file_upload';
          marks: number;
          question_order: number;
          attachment_url?: string;
          explanation?: string;
          test_options?: { id: string; question_id: string; option_text: string; is_correct: boolean; sort_order: number }[];
        }) => ({
          id: q.id,
          testId: q.test_id,
          questionText: q.question_text,
          questionType: q.question_type,
          marks: q.marks,
          questionOrder: q.question_order,
          attachmentUrl: q.attachment_url,
          explanation: q.explanation,
          options: (q.test_options || []).map((o) => ({
            id: o.id,
            questionId: o.question_id,
            optionText: o.option_text,
            isCorrect: o.is_correct,
            sortOrder: o.sort_order,
          })),
        }));

      return {
        id: data.id,
        title: data.title,
        subjectId: data.subject_id,
        subjectName: data.subjects?.name || '1st Year Intermediate',
        subjectCode: data.subjects?.code || 'FSC-PED-11',
        unitId: data.unit_id,
        unitTitle: data.units?.title,
        date: new Date(data.date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        }),
        time: data.time,
        durationMinutes: data.duration_minutes,
        totalMarks: data.total_marks,
        passingMarks: data.passing_marks,
        instructions: data.instructions,
        type: data.type,
        syllabusCoverage: data.syllabus_coverage,
        status: data.status,
        questions,
        myAttempt: myAtt
          ? {
              id: myAtt.id,
              testId: data.id,
              studentId: myAtt.student_id,
              startedAt: myAtt.started_at,
              submittedAt: myAtt.submitted_at,
              status: myAtt.status,
              totalScore: myAtt.total_score,
              percentage: myAtt.percentage,
              grade: myAtt.grade,
              passed: myAtt.passed,
              feedback: myAtt.feedback,
              answers: (myAtt.test_answers || []).map((ans: {
                id: string;
                question_id: string;
                selected_option_id?: string;
                text_answer?: string;
                file_url?: string;
                is_flagged_for_review?: boolean;
                marks_awarded?: number;
                feedback?: string;
              }) => ({
                id: ans.id,
                questionId: ans.question_id,
                selectedOptionId: ans.selected_option_id,
                textAnswer: ans.text_answer,
                fileUrl: ans.file_url,
                isFlaggedForReview: ans.is_flagged_for_review,
                marksAwarded: ans.marks_awarded,
                feedback: ans.feedback,
              })),
            }
          : undefined,
      };
    } catch {
      return SAMPLE_TESTS.find((t) => t.id === testId) || null;
    }
  },

  /**
   * Schedule automated daily test series for an entire book across the semester (through Feb 28)
   */
  scheduleDailyTestsForBook(params: {
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    bookTitle: string;
    assignedDay?: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
    totalWeeks?: number;
    startDate?: string;
  }): TestItem[] {
    const existing = getCustomTests();
    const created: TestItem[] = [];
    const weeks = params.totalWeeks || 14;

    const subjectDayMap: Record<string, 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'> = {
      'sub_01': 'Monday',
      'sub_02': 'Tuesday',
      'sub_03': 'Wednesday',
      'sub_04': 'Thursday',
      'sub_05': 'Friday',
      'sub_06': 'Saturday',
    };
    const targetDay = params.assignedDay || subjectDayMap[params.subjectId] || 'Thursday';

    const dayOffsets: Record<string, number> = {
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6,
    };
    const targetDayNum = dayOffsets[targetDay] || 4;

    const baseDate = params.startDate ? new Date(params.startDate) : new Date();
    const currentDay = baseDate.getDay();
    let daysUntilTarget = (targetDayNum - currentDay + 7) % 7;
    if (daysUntilTarget === 0) daysUntilTarget = 7;

    for (let w = 0; w < Math.min(weeks, 12); w++) {
      const testDate = new Date(baseDate);
      testDate.setDate(baseDate.getDate() + daysUntilTarget + (w * 7));
      const dateStr = testDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

      const newTest: TestItem = {
        id: `test_daily_${params.subjectId}_${w + 1}_${Date.now()}`,
        title: `Daily Test Series: Chapter ${w + 1} (${params.subjectName})`,
        subjectId: params.subjectId,
        subjectName: params.subjectName,
        subjectCode: params.subjectCode,
        date: dateStr,
        time: '02:00 PM',
        durationMinutes: 45,
        totalMarks: 30,
        passingMarks: 15,
        type: 'Unit Assessment',
        syllabusCoverage: `${params.bookTitle} — Chapter ${w + 1} Board Short Questions & Theory Problems`,
        instructions: 'Attempt all objective and subjective sections within 45 minutes. Total Marks: 30. Passing benchmark: 15/30 (50%).',
        status: w === 0 ? 'ongoing' : 'scheduled',
        assignedStudentName: 'Student Scholar',
      };
      created.push(newTest);
    }

    const merged = [...created, ...existing];
    saveCustomTests(merged);
    return created;
  },

  /**
   * Schedule a new examination
   */
  async scheduleTest(test: {
    title: string;
    subjectId: string;
    subjectName: string;
    subjectCode: string;
    unitId?: string;
    assignedTo?: string;
    date: string;
    time: string;
    durationMinutes: number;
    totalMarks: number;
    passingMarks?: number;
    syllabusCoverage: string;
    instructions?: string;
    createdBy?: string;
  }): Promise<{ test: TestItem | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockTest: TestItem = {
        id: `tst_${Date.now()}`,
        title: test.title,
        subjectId: test.subjectId,
        subjectName: test.subjectName,
        subjectCode: test.subjectCode,
        unitId: test.unitId,
        assignedTo: test.assignedTo,
        date: test.date,
        time: test.time,
        durationMinutes: test.durationMinutes,
        totalMarks: test.totalMarks,
        passingMarks: test.passingMarks || Math.round(test.totalMarks * 0.4),
        type: 'Unit Assessment',
        syllabusCoverage: test.syllabusCoverage,
        instructions: test.instructions,
        status: 'scheduled',
      };
      return { test: mockTest, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('tests')
        .insert({
          title: test.title,
          subject_id: test.subjectId,
          unit_id: test.unitId || null,
          assigned_to: test.assignedTo || null,
          date: test.date,
          time: test.time,
          duration_minutes: test.durationMinutes,
          total_marks: test.totalMarks,
          passing_marks: test.passingMarks || Math.round(test.totalMarks * 0.4),
          syllabus_coverage: test.syllabusCoverage,
          instructions: test.instructions || null,
          created_by: test.createdBy || null,
        })
        .select(`*, subjects:subject_id(name, code)`)
        .single();

      if (error) throw error;

      return {
        test: {
          id: data.id,
          title: data.title,
          subjectId: data.subject_id,
          subjectName: data.subjects?.name || test.subjectName,
          subjectCode: data.subjects?.code || test.subjectCode,
          unitId: data.unit_id,
          date: test.date,
          time: test.time,
          durationMinutes: data.duration_minutes,
          totalMarks: data.total_marks,
          passingMarks: data.passing_marks,
          type: data.type,
          syllabusCoverage: data.syllabus_coverage,
          instructions: data.instructions,
          status: data.status,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { test: null, error: err instanceof Error ? err : new Error('Failed to schedule test') };
    }
  },

  /**
   * Add a question to an assessment
   */
  async addQuestion(question: {
    testId: string;
    questionText: string;
    questionType: 'mcq' | 'short_answer' | 'long_answer' | 'file_upload';
    marks: number;
    questionOrder: number;
    explanation?: string;
    options?: { optionText: string; isCorrect: boolean }[];
  }): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { data: qData, error: qError } = await supabase
        .from('test_questions')
        .insert({
          test_id: question.testId,
          question_text: question.questionText,
          question_type: question.questionType,
          marks: question.marks,
          question_order: question.questionOrder,
          explanation: question.explanation,
        })
        .select('id')
        .single();

      if (qError) throw qError;

      if (question.questionType === 'mcq' && question.options && question.options.length > 0) {
        const optionRows = question.options.map((opt, idx) => ({
          question_id: qData.id,
          option_text: opt.optionText,
          is_correct: opt.isCorrect,
          sort_order: idx + 1,
        }));

        const { error: optError } = await supabase.from('test_options').insert(optionRows);
        if (optError) throw optError;
      }

      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to add question') };
    }
  },

  /**
   * Start or resume student test attempt
   */
  async startAttempt(
    testId: string,
    studentId: string
  ): Promise<{ attempt: TestAttempt | null; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      const mockAttempt: TestAttempt = {
        id: `att_${Date.now()}`,
        testId,
        studentId,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        answers: [],
      };
      return { attempt: mockAttempt, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .upsert(
          {
            test_id: testId,
            student_id: studentId,
            status: 'in_progress',
          },
          { onConflict: 'test_id,student_id' }
        )
        .select(`
          *,
          test_answers(id, question_id, selected_option_id, text_answer, file_url, is_flagged_for_review)
        `)
        .single();

      if (error) throw error;

      return {
        attempt: {
          id: data.id,
          testId: data.test_id,
          studentId: data.student_id,
          startedAt: data.started_at,
          status: data.status,
          answers: (data.test_answers || []).map((ans: {
            id: string;
            question_id: string;
            selected_option_id?: string;
            text_answer?: string;
            file_url?: string;
            is_flagged_for_review?: boolean;
          }) => ({
            id: ans.id,
            questionId: ans.question_id,
            selectedOptionId: ans.selected_option_id,
            textAnswer: ans.text_answer,
            fileUrl: ans.file_url,
            isFlaggedForReview: ans.is_flagged_for_review,
          })),
        },
        error: null,
      };
    } catch (err: unknown) {
      return { attempt: null, error: err instanceof Error ? err : new Error('Failed to start attempt') };
    }
  },

  /**
   * Save individual answer during test
   */
  async saveAnswer(
    attemptId: string,
    answer: TestAnswer
  ): Promise<{ success: boolean; error: Error | null }> {
    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      const { error } = await supabase.from('test_answers').upsert(
        {
          attempt_id: attemptId,
          question_id: answer.questionId,
          selected_option_id: answer.selectedOptionId || null,
          text_answer: answer.textAnswer || null,
          file_url: answer.fileUrl || null,
          is_flagged_for_review: answer.isFlaggedForReview || false,
        },
        { onConflict: 'attempt_id,question_id' }
      );

      if (error) throw error;
      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to save answer') };
    }
  },

  /**
   * Submit examination attempt and auto-evaluate MCQs
   */
  async submitAttempt(
    attemptId: string,
    test: TestItem,
    answers: TestAnswer[]
  ): Promise<{ attempt: TestAttempt | null; error: Error | null }> {
    // Compute MCQ scores immediately
    let autoScore = 0;
    const questions = test.questions || [];

    questions.forEach((q) => {
      if (q.questionType === 'mcq') {
        const studentAns = answers.find((a) => a.questionId === q.id);
        const correctOpt = q.options?.find((o) => o.isCorrect);
        if (studentAns && correctOpt && studentAns.selectedOptionId === correctOpt.id) {
          autoScore += Number(q.marks) || 0;
        }
      }
    });

    const percentage = Math.round((autoScore / test.totalMarks) * 100);
    const passed = autoScore >= (test.passingMarks || test.totalMarks * 0.4);

    if (!isSupabaseConfigured()) {
      const mockResult: TestAttempt = {
        id: attemptId,
        testId: test.id,
        studentId: 'usr_student_01',
        startedAt: new Date().toISOString(),
        submittedAt: new Date().toISOString(),
        status: 'submitted',
        totalScore: autoScore,
        percentage,
        grade: percentage >= 90 ? 'A*' : percentage >= 80 ? 'A' : percentage >= 70 ? 'B' : percentage >= 50 ? 'C' : 'F',
        passed,
        answers,
      };
      return { attempt: mockResult, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('test_attempts')
        .update({
          submitted_at: new Date().toISOString(),
          status: 'submitted',
          total_score: autoScore,
          percentage,
          passed,
        })
        .eq('id', attemptId)
        .select()
        .single();

      if (error) throw error;

      return {
        attempt: {
          id: data.id,
          testId: data.test_id,
          studentId: data.student_id,
          startedAt: data.started_at,
          submittedAt: data.submitted_at,
          status: data.status,
          totalScore: data.total_score,
          percentage: data.percentage,
          grade: data.grade,
          passed: data.passed,
        },
        error: null,
      };
    } catch (err: unknown) {
      return { attempt: null, error: err instanceof Error ? err : new Error('Failed to submit test') };
    }
  },

  /**
   * Teacher marks test attempt questions, writes feedback, and publishes official results
   */
  async gradeAttempt(params: {
    attemptId: string;
    test: TestItem;
    studentId: string;
    studentName: string;
    studentAvatar?: string;
    gradedQuestions: { questionId: string; marksAwarded: number; feedback?: string }[];
    overallFeedback: string;
    teacherId?: string;
  }): Promise<{ success: boolean; error: Error | null }> {
    const totalScore = params.gradedQuestions.reduce((acc, curr) => acc + curr.marksAwarded, 0);
    const percentage = Math.round((totalScore / params.test.totalMarks) * 100);
    const passed = totalScore >= (params.test.passingMarks || params.test.totalMarks * 0.4);
    const grade =
      percentage >= 90
        ? 'A*'
        : percentage >= 80
        ? 'A'
        : percentage >= 70
        ? 'B'
        : percentage >= 60
        ? 'C'
        : percentage >= 50
        ? 'D'
        : 'F';

    if (!isSupabaseConfigured()) {
      return { success: true, error: null };
    }

    try {
      // 1. Update each answer marks
      for (const item of params.gradedQuestions) {
        await supabase
          .from('test_answers')
          .update({
            marks_awarded: item.marksAwarded,
            feedback: item.feedback,
            graded_by: params.teacherId,
          })
          .eq('attempt_id', params.attemptId)
          .eq('question_id', item.questionId);
      }

      // 2. Update test attempt
      await supabase
        .from('test_attempts')
        .update({
          status: 'graded',
          total_score: totalScore,
          percentage,
          grade,
          passed,
          feedback: params.overallFeedback,
        })
        .eq('id', params.attemptId);

      // 3. Upsert official result record
      await supabase.from('results').upsert(
        {
          test_id: params.test.id,
          student_id: params.studentId,
          score: totalScore,
          max_score: params.test.totalMarks,
          percentage,
          passing_marks: params.test.passingMarks || 40,
          passed,
          grade,
          feedback: params.overallFeedback,
        },
        { onConflict: 'test_id,student_id' }
      );

      return { success: true, error: null };
    } catch (err: unknown) {
      return { success: false, error: err instanceof Error ? err : new Error('Failed to grade test') };
    }
  },

  /**
   * Fetch official certified results
   */
  async fetchResults(studentId?: string): Promise<ResultRecord[]> {
    if (!isSupabaseConfigured()) {
      return SAMPLE_RESULTS;
    }

    try {
      let query = supabase
        .from('results')
        .select(`
          *,
          tests:test_id(title, date, passing_marks, subjects(name, code)),
          profiles:student_id(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (studentId) {
        query = query.eq('student_id', studentId);
      }

      const { data, error } = await query;

      if (error || !data || data.length === 0) {
        return SAMPLE_RESULTS;
      }

      return data.map((item) => {
        const score = Number(item.score);
        const maxScore = Number(item.max_score) || 100;
        const pct = item.percentage ? Number(item.percentage) : Math.round((score / maxScore) * 100);
        const passMarks = item.passing_marks ? Number(item.passing_marks) : 40;
        const isPassed = item.passed !== undefined ? item.passed : score >= passMarks;

        return {
          id: item.id,
          testId: item.test_id,
          testTitle: item.tests?.title || 'Academic Assessment',
          subjectName: item.tests?.subjects?.name || '1st Year Intermediate',
          subjectCode: item.tests?.subjects?.code || 'FSC-CSC-11',
          date: item.tests?.date
            ? new Date(item.tests.date).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })
            : 'Nov 02, 2026',
          studentId: item.student_id,
          studentName: item.profiles?.full_name || 'Enrolled Student',
          studentAvatar:
            item.profiles?.avatar_url ||
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop',
          score,
          maxScore,
          percentage: pct,
          passingMarks: passMarks,
          passed: isPassed,
          grade: item.grade || (pct >= 90 ? 'A*' : pct >= 80 ? 'A' : pct >= 60 ? 'B' : 'C'),
          rank: item.rank || '1st in Cohort',
          feedback: item.feedback || 'Certified grade verified by faculty examination board.',
        };
      });
    } catch {
      return SAMPLE_RESULTS;
    }
  },
};
