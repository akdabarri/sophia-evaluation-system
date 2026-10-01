import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, introText, methodText, resultText, discussText } = body;

    if (!username || !introText || !methodText || !resultText || !discussText) {
      return NextResponse.json({ error: "Seluruh bab naskah IMRaD wajib diisi." }, { status: 400 });
    }

    // 1. Ambil data kelompok dan verifikasi kuota token
    const { data: group, error: groupErr } = await supabase
      .from("groups")
      .select("id, tokens_left")
      .eq("username", username)
      .single();

    if (groupErr || !group) {
      return NextResponse.json({ error: "Kelompok tidak terdaftar." }, { status: 404 });
    }

    if (group.tokens_left <= 0) {
      return NextResponse.json({ error: "Kuota token komputasi kelompok Anda telah habis." }, { status: 403 });
    }

    // 2. Hitung Iterasi Historis agar angka iterasi selalu akurat
    const { count: submissionCount } = await supabase
      .from("submissions")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group.id);
      
    const currentIteration = (submissionCount || 0) + 1;

    // 3. Format instruksi rubrik evaluasi untuk OpenAI (MASTER PROMPT FINAL)
    const systemPrompt = `Anda adalah seorang Senior Associate Editor untuk jurnal Q1 Scopus dan Ahli Metodologi Systematic Literature Review (SLR) di bidang Computer Science/Informatics Education.

Tugas Anda adalah menelaah dan memberikan skor pada draf SLR mahasiswa tingkat sarjana yang ditulis dalam format IMRaD. 

Untuk mencegah halusinasi evaluasi, Anda WAJIB mendasarkan penilaian HANYA pada definisi dan kerangka acuan berikut:

### KNOWLEDGE BASE 1: PRISMA 2020 STATEMENT (Page et al., 2021)
Gunakan 10 Item wajib ini untuk menilai transparansi dan kelayakan metode:
* Item 3 (Rationale): Penulis harus mendeskripsikan rasionalitas tinjauan berdasarkan literatur yang sudah ada (menunjukkan Research Gap).
* Item 4 (Objectives): Pertanyaan penelitian harus eksplisit, disarankan menggunakan kerangka PICOC (Population, Intervention, Comparison, Outcome, Context).
* Item 5 (Eligibility Criteria): Penulis harus merinci spesifikasi inklusi dan eksklusi dengan argumen logis, bukan sekadar membatasi tahun tanpa alasan.
* Item 6 & 7 (Information Sources & Search Strategy): Penulis wajib menyebutkan basis data spesifik dan menyajikan 'Boolean Search String' yang utuh dan presisi (menggunakan AND/OR).
* Item 8 (Selection Process): Harus ada penjelasan bagaimana naskah disaring dari ribuan menjadi belasan.
* Item 16 (Study Selection): Harus mendeskripsikan hasil penyusutan literatur yang sejalan dengan PRISMA Flow Diagram.
* Item 17 & 20 (Study Characteristics & Synthesis): Data wajib disajikan terstruktur, disintesis secara tematik, mengelompokkan temuan antar studi, bukan sekadar merangkum deskriptif per studi.
* Item 23 (Discussion & Limitations): Harus menginterpretasikan hasil, memberikan implikasi praktis/teoritis, dan secara transparan mengakui batasan/kelemahan dari SLR yang dilakukan.

### KNOWLEDGE BASE 2: KITCHENHAM & CHARTERS (2007) GUIDELINES FOR SE SLR
Dalam konteks ilmu komputer/informatika, SLR yang baik wajib memiliki replikabilitas tinggi (dapat diulang dengan hasil yang sama oleh mesin/peneliti lain). 
Pelanggaran paling berat (Fatal Flaw) menurut Kitchenham adalah "Annotated Bibliography" yaitu jika mahasiswa hanya merangkum studi secara serial (Contoh: "Jurnal A meneliti X. Jurnal B meneliti Y") tanpa melakukan "Cross-Study Synthesis" (menganalisis persetujuan, kontradiksi, atau pola di antara Jurnal A dan B).

### KNOWLEDGE BASE 3: HATTIE & TIMPERLEY (2007) FORMATIVE FEEDBACK
Setiap umpan balik yang Anda berikan harus dipecah menjadi 3 dimensi:
1. Feed-Up (Ekspektasi): Klarifikasi kepada mahasiswa standar keilmuan Q1 apa yang seharusnya dicapai pada bagian tersebut.
2. Feed-Back (Kondisi Saat Ini): Kritik tajam, analitis, dan blak blakan mengenai letak kecacatan, inkonsistensi, atau kelemahan dari draf mahasiswa saat ini.
3. Feed-Forward (Tindakan): Instruksi taktis, spesifik, berupa langkah konkret (poin per poin) yang harus dilakukan mahasiswa pada revisi selanjutnya.

=======================================================

### STANDAR RUBRIK EVALUASI KRITIS (SKOR 0 100):

[MODUL 1: INTRODUCTION Berdasarkan PRISMA Item 3 & 4]
Aturan Penalti: Maksimal Skor 75 jika penulis gagal membuktikan urgensi (Item 3) atau RQ tidak terukur (Item 4).

[MODUL 2: METHODOLOGY Berdasarkan PRISMA Item 5, 6, 7, 8 & Kitchenham]
Aturan Penalti: Maksimal Skor 65 (FATAL) jika Boolean query dan database tidak dijabarkan utuh, sehingga Mustahil direplikasi (pelanggaran prinsip Kitchenham).

[MODUL 3: RESULTS Berdasarkan PRISMA Item 16, 17, 20 & Kitchenham]
Aturan Penalti: Maksimal Skor 65 (FATAL) jika mahasiswa terjebak melakukan "Annotated Bibliography" dan gagal melakukan sintesis tematik lintas studi.

[MODUL 4: DISCUSSION & CONCLUSION Berdasarkan PRISMA Item 23]
Aturan Penalti: Maksimal Skor 80 jika bab ini sekadar mengulang (copy paste) bab Results, atau gagal mengakui batasan metode (Item 23c).

### FORMAT OUTPUT WAJIB (JSON MURNI):
Keluarkan hasil evaluasi Anda HANYA dalam format JSON. TIDAK ADA teks pengantar, penutup, atau blok \`\`\`json. 

{
  "totalScore": (integer 0 100),
  "evaluations": [
    {
      "chapterName": "1. Introduction",
      "score": (integer 0 100),
      "strengths": "(1 kalimat) Keunggulan spesifik draf.",
      "improvements": "(1 kalimat) Titik kelemahan paling fatal.",
      "pedagogicalAlignment": {
        "feedUp": "(1 kalimat standar dari PRISMA/Kitchenham yang dituntut)",
        "feedBack": "(1 2 paragraf kritik tajam membongkar cacat argumen)",
        "feedForward": "(2 3 poin numerik instruksi perbaikan taktis)"
      }
    },
    {
      "chapterName": "2. Methodology",
      "score": (integer 0 100),
      "strengths": "...",
      "improvements": "...",
      "pedagogicalAlignment": {
        "feedUp": "...",
        "feedBack": "...",
        "feedForward": "..."
      }
    },
    {
      "chapterName": "3. Results",
      "score": (integer 0 100),
      "strengths": "...",
      "improvements": "...",
      "pedagogicalAlignment": {
        "feedUp": "...",
        "feedBack": "...",
        "feedForward": "..."
      }
    },
    {
      "chapterName": "4. Conclusion",
      "score": (integer 0 100),
      "strengths": "...",
      "improvements": "...",
      "pedagogicalAlignment": {
        "feedUp": "...",
        "feedBack": "...",
        "feedForward": "..."
      }
    }
  ]
}
`;

    // 4. Susun Draft Mahasiswa (Variabel yang terlewat)
    const userDraft = `
Silakan evaluasi draf naskah berikut:

[1. INTRODUCTION]:
${introText}

[2. METHODOLOGY]:
${methodText}

[3. RESULTS]:
${resultText}

[4. DISCUSSION]:
${discussText}
`;

    // 5. Panggil API OpenAI
    const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userDraft },
        ],
        temperature: 0.2,
      }),
    });

    if (!openAiRes.ok) {
      const errDetail = await openAiRes.text();
      console.error("OpenAI Error:", errDetail);
      return NextResponse.json({ error: "Gagal memproses inferensi AI." }, { status: 500 });
    }

    const openAiData = await openAiRes.json();
    let evaluationResult;
    try {
      evaluationResult = JSON.parse(openAiData.choices[0].message.content);
    } catch (parseErr) {
      console.error("JSON Parse Error:", parseErr);
      return NextResponse.json({ error: "Format luaran AI tidak valid (JSON Parse Error)." }, { status: 500 });
    }

    // 6. Komputasi Total Skor Secara Matematis (Server side Override)
    // Jangan biarkan AI menghitung skor total. Sistem yang menghitung rata rata dari skor modul.
    let computedTotalScore = 0;
    
    if (evaluationResult.evaluations && Array.isArray(evaluationResult.evaluations)) {
      const totalModuleScore = evaluationResult.evaluations.reduce((acc: number, curr: any) => {
        return acc + (Number(curr.score) || 0);
      }, 0);
      
      const moduleCount = evaluationResult.evaluations.length;
      computedTotalScore = moduleCount > 0 ? Math.round(totalModuleScore / moduleCount) : 0;
    }

    // 7. Masukkan hasil ke tabel submissions
    const { data: newSubmission, error: subErr } = await supabase
      .from("submissions")
      .insert({
        group_id: group.id,
        iteration_number: currentIteration,
        status: "PENDING_REVIEW",
        intro_text: introText,
        method_text: methodText,
        result_text: resultText,
        discuss_text: discussText,
        ai_raw_feedback: evaluationResult, 
        ai_total_score: computedTotalScore, // Menggunakan skor hasil komputasi presisi
      })
      .select()
      .single();

    if (subErr) {
      console.error("Database Insert Error:", subErr.message);
      return NextResponse.json({ error: "Gagal menyimpan draf ke basis data." }, { status: 500 });
    }

    // 8. Potong 1 kuota token kelompok
    await supabase
      .from("groups")
      .update({ tokens_left: group.tokens_left - 1 })
      .eq("id", group.id);

    return NextResponse.json({ success: true, submissionId: newSubmission.id });
  } catch (error: any) {
    console.error("Server Route Error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}