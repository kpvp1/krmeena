"use client";
import { useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  // ==============================
  // LUCKY DRAW
  // ==============================

  const [spinOpen, setSpinOpen] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [selected, setSelected] = useState(false);

  // ==============================
  // CLAIM FORM
  // ==============================

  const [claimOpen, setClaimOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [mobile, setMobile] = useState("");

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
const quotes = [
  "“जनता की बात सुनना ही जनसेवा की पहली सीढ़ी है।”",
  "“पारदर्शिता और जवाबदेही से ही बेहतर पंचायत बनती है।”",
  "“शिक्षा, विकास और जनहित — पंचायत की प्राथमिकता।”",
  "“हर नागरिक की समस्या को सुनना और समझना जरूरी है।”",
];

const [quoteIndex, setQuoteIndex] = useState(0);

useEffect(() => {
  const interval = setInterval(() => {
    setQuoteIndex((prev) => (prev + 1) % quotes.length);
  }, 4000);

  return () => clearInterval(interval);
}, []);
  // ==============================
  // JAN SAMASYA FORM
  // ==============================

  const [issueName, setIssueName] = useState("");
  const [issueMobile, setIssueMobile] = useState("");
  const [issueVillage, setIssueVillage] = useState("");
  const [issueType, setIssueType] = useState("समस्या");
  const [issueDetails, setIssueDetails] = useState("");

  const [issueError, setIssueError] = useState("");
  const [issueLoading, setIssueLoading] = useState(false);
  const [issueSuccess, setIssueSuccess] = useState(false);
  const [issueComplaintNo, setIssueComplaintNo] = useState("");

  const gifts = ["🎁", "🎁", "🎁", "🎁", "🎁", "🎁", "🎁", "🎁"];

  // ==============================
  // OPEN SPIN
  // ==============================

  const openSpin = () => {
    setSpinOpen(true);
    setSpinning(false);
    setRotation(0);
    setSelected(false);
    setError("");
  };

  // ==============================
  // SPIN
  // ==============================

  const handleSpin = () => {
    if (spinning) return;

    setSpinning(true);
    setSelected(false);

    const extraRotation =
      360 * 7 + Math.floor(Math.random() * 360);

    setRotation(extraRotation);

    setTimeout(() => {
      setSpinning(false);
      setSelected(true);
    }, 5000);
  };

  // ==============================
  // OPEN CLAIM
  // ==============================

  const openClaim = () => {
    setClaimOpen(true);
    setError("");
  };

  // ==============================
  // SUBMIT CLAIM
  // ==============================

  const submitClaim = async () => {
    setError("");

    const cleanName = name.trim();
    const cleanFatherName = fatherName.trim();
    const cleanMobile = mobile.trim();

    if (cleanName.length < 2) {
      setError("कृपया अपना नाम दर्ज करें।");
      return;
    }

    if (cleanFatherName.length < 2) {
      setError("कृपया पिता का नाम दर्ज करें।");
      return;
    }

    if (cleanMobile && !/^[6-9]\d{9}$/.test(cleanMobile)) {
      setError("कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।");
      return;
    }

    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from("gift_claims")
        .insert({
          name: cleanName,
          father_name: cleanFatherName,
          mobile: cleanMobile,
          gift: "Lucky Draw",
        });

      if (insertError) {
        console.error(insertError);

        setError(
          "Entry save नहीं हो पाई। कृपया दोबारा प्रयास करें।"
        );

        return;
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);

      setError(
        "कुछ समस्या हुई। कृपया दोबारा प्रयास करें।"
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ==============================
  // SUBMIT JAN SAMASYA
  // ==============================

  const submitIssue = async () => {
  setIssueError("");
  setIssueSuccess(false);
  setIssueComplaintNo("");

  const cleanName = issueName.trim();
  const cleanMobile = issueMobile.trim();
  const cleanVillage = issueVillage.trim();
  const cleanDetails = issueDetails.trim();

  if (cleanName.length < 2) {
    setIssueError("कृपया अपना नाम दर्ज करें।");
    return;
  }

  if (
    cleanMobile &&
    !/^[6-9]\d{9}$/.test(cleanMobile)
  ) {
    setIssueError(
      "कृपया सही 10 अंकों का मोबाइल नंबर दर्ज करें।"
    );
    return;
  }

  if (cleanVillage.length < 2) {
    setIssueError("कृपया अपना ग्राम दर्ज करें।");
    return;
  }

  if (cleanDetails.length < 5) {
    setIssueError(
      "कृपया अपनी समस्या, मांग या सुझाव विस्तार से लिखें।"
    );
    return;
  }

  setIssueLoading(true);

  try {
    const { data, error: insertError } = await supabase
      .from("public_issues")
      .insert({
        name: cleanName,
        mobile: cleanMobile,
        village: cleanVillage,
        issue_type: issueType,
        details: cleanDetails,
        status: "Pending",
      })
      .select("complaint_no")
      .single();

    if (insertError) {
      console.error("SUPABASE ERROR:", insertError);

      setIssueError(
        "आपकी जानकारी सेव नहीं हो पाई। कृपया दोबारा प्रयास करें।"
      );

      return;
    }

    console.log("Complaint Number:", data?.complaint_no);

    if (!data?.complaint_no) {
      setIssueError(
        "जानकारी सेव हो गई, लेकिन शिकायत संख्या प्राप्त नहीं हुई।"
      );
      return;
    }

    // Complaint number save
    setIssueComplaintNo(data.complaint_no);

    // Success message
    setIssueSuccess(true);

    // Form clear
    setIssueName("");
    setIssueMobile("");
    setIssueVillage("");
    setIssueType("समस्या");
    setIssueDetails("");

  } catch (err) {
    console.error("ERROR:", err);

    setIssueError(
      "कुछ समस्या हुई। कृपया दोबारा प्रयास करें।"
    );
  } finally {
    setIssueLoading(false);
  }
};

  return (
    <main className="min-h-screen bg-sky-100 text-slate-900 overflow-hidden">

      {/* ==============================
          WATERMARK
      ============================== */}

      <div className="fixed inset-0 pointer-events-none flex items-center justify-center opacity-[0.035] z-0">
        <div className="text-[70px] md:text-[110px] font-black rotate-[-25deg] whitespace-nowrap text-sky-900">
          अबकी बार ईमानदार सेवक
        </div>
      </div>

      {/* ==============================
          NAVBAR
      ============================== */}

      <nav className="relative z-50 sticky top-0 bg-sky-950/95 backdrop-blur-md border-b border-yellow-400/30 text-white shadow-lg">

        <div className="max-w-7xl mx-auto px-5 py-4 flex items-center justify-between">

          <a
            href="#home"
            className="font-extrabold text-xl md:text-2xl text-yellow-300"
          >
            बांसनी जोजावर
          </a>

          {/* DESKTOP MENU */}

          <div className="hidden md:flex items-center gap-6 text-sm font-bold">

            <a
              href="#home"
              className="hover:text-yellow-300 transition"
            >
              होम
            </a>

            <a
              href="#parichay"
              className="hover:text-yellow-300 transition"
            >
              परिचय
            </a>

            <a
              href="#seva"
              className="hover:text-yellow-300 transition"
            >
              सेवा यात्रा
            </a>

            <a
              href="#karyashaili"
              className="hover:text-yellow-300 transition"
            >
              कार्य-शैली
            </a>

            <a
              href="#priority"
              className="hover:text-yellow-300 transition"
            >
              प्राथमिकताएँ
            </a>

            <a
              href="#jan-samasya"
              className="hover:text-yellow-300 transition"
            >
              जन समस्या
            </a>

          </div>

          {/* MOBILE MENU BUTTON */}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden text-2xl"
          >
            ☰
          </button>

        </div>

        {/* MOBILE MENU */}

        {menuOpen && (
          <div className="md:hidden px-5 pb-5 space-y-3 border-t border-white/10">

            <a
              href="#home"
              onClick={() => setMenuOpen(false)}
              className="block py-2 font-bold hover:text-yellow-300"
            >
              होम
            </a>

            <a
              href="#parichay"
              onClick={() => setMenuOpen(false)}
              className="block py-2 font-bold hover:text-yellow-300"
            >
              परिचय
            </a>

            <a
              href="#seva"
              onClick={() => setMenuOpen(false)}
              className="block py-2 font-bold hover:text-yellow-300"
            >
              सेवा यात्रा
            </a>

            <a
              href="#karyashaili"
              onClick={() => setMenuOpen(false)}
              className="block py-2 font-bold hover:text-yellow-300"
            >
              कार्य-शैली
            </a>

            <a
              href="#priority"
              onClick={() => setMenuOpen(false)}
              className="block py-2 font-bold hover:text-yellow-300"
            >
              प्राथमिकताएँ
            </a>

            <a
              href="#jan-samasya"
              onClick={() => setMenuOpen(false)}
              className="block py-2 font-bold hover:text-yellow-300"
            >
              जन समस्या
            </a>

          </div>
        )}

      </nav>

      {/* ==============================
          HERO
      ============================== */}

      <section
  id="home"
  className="relative z-10 min-h-[90vh]"
>
        <div className="w-full flex justify-center pt-8 mb-7 px-2">
          <div className="w-full max-w-5xl overflow-hidden rounded-2xl bg-white/80 border border-sky-200 shadow-md">
            <div
              key={quoteIndex}
              className="px-5 py-4 text-center animate-[quoteSlide_0.8s_ease-out]"
            >
              <p className="text-lg sm:text-xl md:text-2xl font-bold text-sky-900">
                {quotes[quoteIndex]}
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto w-full px-5 py-16">

          <div className="grid md:grid-cols-2 gap-12 items-center">

            {/* HERO LEFT */}

            <div className="text-center md:text-left">

  {/* ग्राम पंचायत */}
  <div className="w-full flex justify-center mb-8 px-2">
  <div className="w-full max-w-5xl flex items-center justify-center px-4 py-5 rounded-2xl bg-white/90 border-2 border-sky-300 shadow-lg">
    <span className="text-center text-lg sm:text-xl md:text-3xl font-black text-sky-900 leading-tight">
      ग्राम पंचायत बांसनी जोजावर से भावी सरपंच उम्मीदवार
    </span>
  </div>
</div>

 {/* नाम */}
<h1
  className="
    whitespace-nowrap
    text-4xl sm:text-5xl md:text-6xl lg:text-7xl
    font-extrabold
    leading-tight
    tracking-wide
    text-orange-800
    drop-shadow-[2px_3px_2px_rgba(0,0,0,0.15)]
  "
>
  कालू राम मीणा
</h1>

  {/* पद */}
  <h2 className="text-3xl md:text-4xl lg:text-5xl mt-5 text-sky-400 font-extrabold">
    (सेवानिवृत्त शिक्षक)
  </h2>

  {/* परिचय */}
  <p className="mt-7 text-xl md:text-2xl text-slate-700 leading-relaxed font-semibold max-w-3xl">
    अनुभव, शिक्षा, पारदर्शिता और जनसेवा की भावना के साथ
    ग्राम पंचायत के विकास एवं जनहित से जुड़े विषयों पर
    सकारात्मक प्रयास।
  </p>

  {/* Buttons */}
  <div className="mt-9 flex flex-wrap gap-4 justify-center md:justify-start">

    <a
      href="#parichay"
      className="px-7 py-4 rounded-xl bg-sky-700 text-white font-extrabold text-lg hover:bg-sky-800 transition shadow-lg"
    >
      परिचय देखें
    </a>

    <a
      href="#jan-samasya"
      className="px-7 py-4 rounded-xl bg-white border-2 border-sky-700 text-sky-800 font-extrabold text-lg hover:bg-sky-50 transition shadow-lg"
    >
      जन समस्या दर्ज करें
    </a>

  </div>

</div>

            {/* HERO IMAGE */}

            <div className="flex justify-center">
  <div className="relative">

    {/* MOBILE NUMBER */}
    <div className="mb-4 flex justify-center">
      <a
        href="tel:99291 83442"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 border-2 border-sky-300 shadow-lg text-sky-900 font-extrabold text-lg hover:bg-sky-50 transition"
      >
        📞 <span>99291 83442</span>
      </a>
    </div>

    {/* PHOTO */}
    <div className="relative">
      <div className="absolute inset-0 bg-sky-400/30 blur-3xl rounded-full" />

      <img
        src="/kalu-ram-meena.jpg"
        alt="कालू राम मीणा"
        className="relative w-80 h-[430px] sm:w-96 sm:h-[500px] md:w-[430px] md:h-[560px] lg:w-[480px] lg:h-[620px] object-cover rounded-3xl border-4 border-white shadow-2xl"
      />
    </div>

  </div>
</div>

        </div>

      </div>

    

  </section>

      {/* ==============================
          LUCKY DRAW SECTION
      ============================== */}

      <section className="relative z-10 px-5 py-16">

        <div className="max-w-5xl mx-auto">

          <div className="rounded-3xl border border-sky-300 bg-gradient-to-br from-white to-sky-200 p-8 md:p-12 text-center shadow-xl">

            <div className="text-5xl mb-5">
              🎁
            </div>

            <h2 className="text-3xl md:text-4xl font-black text-sky-900">
              Lucky Draw
            </h2>

            <p className="mt-5 text-lg md:text-xl text-slate-700 font-semibold leading-relaxed">
              कालू राम मीणा को अपना समर्थन देने के लिए नीचे दिए गए बटन पर क्लिक करें!
            </p>

            <button
              onClick={openSpin}
              className="mt-8 px-8 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg shadow-xl transition transform hover:scale-105"
            >
              कालू राम मीणा को वोट करे
            </button>

          </div>

        </div>

      </section>

      {/* ==============================
          PARICHAY
      ============================== */}

      <section
        id="parichay"
        className="relative z-10 px-5 py-16 bg-sky-200/50"
      >

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-black text-center text-sky-900">
            परिचय
          </h2>

          <div className="mt-10 grid md:grid-cols-2 gap-8">

            <div className="rounded-3xl border border-sky-200 bg-white/90 p-8 shadow-lg">

              <h3 className="text-2xl font-extrabold mb-4 text-slate-900">
                शिक्षा और अनुभव
              </h3>

              <p className="text-slate-700 leading-relaxed">
                शिक्षा के क्षेत्र में लंबे समय तक कार्य करने के अनुभव के साथ
                ग्रामीण जीवन, विद्यार्थियों और आमजन से जुड़े विषयों की
                समझ को जनसेवा के कार्यों में उपयोग करने का संकल्प।
              </p>

            </div>

            <div className="rounded-3xl border border-sky-200 bg-white/90 p-8 shadow-lg">

              <h3 className="text-2xl font-extrabold mb-4 text-slate-900">
                जनसेवा का उद्देश्य
              </h3>

              <p className="text-slate-700 leading-relaxed">
                ग्राम पंचायत में पारदर्शिता, संवाद और उपलब्ध संसाधनों के
                बेहतर उपयोग के माध्यम से विकास कार्यों को आगे बढ़ाने
                का प्रयास।
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ==============================
          SEVA YATRA
      ============================== */}

      <section
        id="seva"
        className="relative z-10 px-5 py-16"
      >

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-black text-center text-sky-900">
            सेवा यात्रा
          </h2>

          <div className="mt-10 grid md:grid-cols-3 gap-6">

            {[
              {
                icon: "📚",
                title: "शिक्षा",
                text: "शिक्षा के प्रति जागरूकता और विद्यार्थियों के लिए बेहतर अवसर।",
              },
              {
                icon: "🤝",
                title: "जनसंवाद",
                text: "ग्रामीणों की समस्याओं को सुनना और प्राथमिकता के आधार पर समाधान का प्रयास।",
              },
              {
                icon: "🌱",
                title: "विकास",
                text: "ग्राम के आधारभूत विकास और स्वच्छ वातावरण के लिए सकारात्मक पहल।",
              },
            ].map((item, index) => (

              <div
                key={index}
                className="rounded-3xl border border-sky-200 bg-white/90 p-7 shadow-lg hover:-translate-y-1 transition"
              >

                <div className="text-4xl">
                  {item.icon}
                </div>

                <h3 className="text-xl font-extrabold mt-4 text-slate-900">
                  {item.title}
                </h3>

                <p className="mt-3 text-slate-700 leading-relaxed">
                  {item.text}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ==============================
          KARYA SHAILI
      ============================== */}

      <section
        id="karyashaili"
        className="relative z-10 px-5 py-16 bg-sky-200/50"
      >

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-black text-center text-sky-900">
            कार्य-शैली
          </h2>

          <div className="mt-10 space-y-5">

            {[
              "पारदर्शिता और जवाबदेही को प्राथमिकता।",
              "ग्रामवासियों के साथ नियमित जनसंवाद।",
              "विकास कार्यों में प्राथमिकता और आवश्यकता के आधार पर योजना।",
              "उपलब्ध सरकारी योजनाओं की जानकारी आमजन तक पहुँचाने का प्रयास।",
              "शिक्षा, स्वच्छता और आधारभूत सुविधाओं पर विशेष ध्यान।",
            ].map((item, index) => (

              <div
                key={index}
                className="flex gap-4 items-start rounded-2xl border border-sky-200 bg-white/90 p-5 shadow-md"
              >

                <span className="text-sky-700 font-black text-xl">
                  ✓
                </span>

                <p className="text-slate-700 font-semibold">
                  {item}
                </p>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ==============================
          DEVELOPMENT PRIORITIES
      ============================== */}

      <section
        id="priority"
        className="relative z-10 px-5 py-16"
      >

        <div className="max-w-6xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-black text-center text-sky-900">
            विकास प्राथमिकताएँ
          </h2>

          <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">

            {[
              ["💧", "पेयजल व्यवस्था"],
              ["🛣️", "सड़क एवं रास्ते"],
              ["💡", "बिजली एवं प्रकाश"],
              ["🧹", "स्वच्छता"],
              ["🏫", "शिक्षा"],
              ["🌳", "हरित एवं स्वच्छ ग्राम"],
            ].map(([icon, title], index) => (

              <div
                key={index}
                className="rounded-3xl border border-sky-300 bg-white/90 p-7 text-center shadow-lg hover:-translate-y-1 transition"
              >

                <div className="text-4xl">
                  {icon}
                </div>

                <h3 className="mt-4 text-xl font-extrabold text-slate-900">
                  {title}
                </h3>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ==============================
          FIRST 100 DAYS
      ============================== */}

      <section
        className="relative z-10 px-5 py-16 bg-sky-200/50"
      >

        <div className="max-w-5xl mx-auto">

          <h2 className="text-3xl md:text-4xl font-black text-center text-sky-900">
            पहले 100 दिनों की प्राथमिकताएँ
          </h2>

          <div className="mt-10 grid md:grid-cols-2 gap-5">

            {[
              "ग्राम की प्रमुख समस्याओं की सूची तैयार करना।",
              "आवश्यक विकास कार्यों की प्राथमिकता तय करना।",
              "जनसंवाद के माध्यम से सुझाव प्राप्त करना।",
              "सरकारी योजनाओं की जानकारी ग्रामीणों तक पहुँचाना।",
              "स्वच्छता एवं सार्वजनिक स्थानों पर ध्यान देना।",
              "आवश्यक सुविधाओं से जुड़े विषयों को संबंधित विभागों तक पहुँचाना।",
            ].map((item, index) => (

              <div
                key={index}
                className="rounded-2xl bg-white/90 border border-sky-200 p-5 shadow-md"
              >

                <span className="text-sky-700 font-black mr-3">
                  {index + 1}.
                </span>

                <span className="text-slate-700 font-semibold">
                  {item}
                </span>

              </div>

            ))}

          </div>

        </div>

      </section>

      {/* ==============================
          JAN SAMVAD
      ============================== */}

      <section className="relative z-10 px-5 py-16">

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl md:text-4xl font-black text-sky-900">
            जनसंवाद
          </h2>

          <p className="mt-6 text-lg text-slate-700 leading-relaxed">
            ग्रामवासियों के सुझाव, समस्याएँ और आवश्यकताएँ विकास की दिशा
            तय करने में महत्वपूर्ण हैं। जनसंवाद के माध्यम से प्रत्येक
            विषय को सुनने और उचित स्तर तक पहुँचाने का प्रयास रहेगा।
          </p>

        </div>

      </section>

      {/* ==================================================
          JAN SAMASYA & SUGGESTION FORM
      ================================================== */}

      <section
        id="jan-samasya"
        className="relative z-10 px-5 py-16 bg-gradient-to-br from-sky-200/60 to-white"
      >

        <div className="max-w-4xl mx-auto">

          <div className="rounded-3xl border border-sky-300 bg-white shadow-2xl p-7 md:p-10">

            {/* HEADER */}

            <div className="text-center">

              <div className="text-5xl mb-4">
                📝
              </div>

              <h2 className="text-3xl md:text-4xl font-black text-sky-900">
                जन समस्या एवं सुझाव
              </h2>

              <p className="mt-4 text-slate-600 text-base md:text-lg leading-relaxed">
                ग्राम पंचायत बांसनी जोजावर से संबंधित अपनी समस्या,
                मांग या सुझाव यहाँ दर्ज करें।
              </p>

            </div>

            {/* SUCCESS */}

            {issueSuccess && (
  <div className="mt-7 rounded-2xl bg-green-100 border-2 border-green-400 px-5 py-6 text-green-800 text-center shadow-md">

    <div className="text-4xl mb-3">
      ✅
    </div>

    <h3 className="text-xl font-black">
      आपकी समस्या / मांग / सुझाव सफलतापूर्वक दर्ज हो गया है।
    </h3>

    <p className="mt-4 font-bold">
      आपकी शिकायत संख्या
    </p>

    <div className="mt-2 inline-block px-8 py-3 rounded-xl bg-white border-2 border-green-500 text-2xl font-black text-green-700">
      {issueComplaintNo || "नंबर प्राप्त नहीं हुआ"}
    </div>

    <p className="mt-4 text-sm font-semibold">
      कृपया इस नंबर को सुरक्षित रखें।
    </p>

    <p className="mt-2 text-xs text-green-700">
      धन्यवाद!
    </p>

  </div>
)}
            {/* ERROR */}

            {issueError && (

              <div className="mt-7 rounded-2xl bg-red-100 border border-red-400 px-5 py-4 text-red-700 font-bold">

                ⚠️ {issueError}

              </div>

            )}

            {/* FORM */}

            <div className="mt-8 space-y-5">

              {/* NAME */}

              <div>

                <label className="block text-sky-900 font-black mb-2">
                  नाम <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={issueName}
                  onChange={(e) => setIssueName(e.target.value)}
                  placeholder="अपना नाम लिखें"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                />

              </div>

              {/* MOBILE */}

              <div>

                <label className="block text-sky-900 font-black mb-2">
                  मोबाइल नंबर
                </label>

                <input
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={issueMobile}
                  onChange={(e) => {
                    const value = e.target.value.replace(
                      /\D/g,
                      ""
                    );

                    setIssueMobile(value);
                  }}
                  placeholder="10 अंकों का मोबाइल नंबर"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                />

              </div>

              {/* VILLAGE */}

              <div>

                <label className="block text-sky-900 font-black mb-2">
                  ग्राम <span className="text-red-500">*</span>
                </label>

                <input
                  type="text"
                  value={issueVillage}
                  onChange={(e) =>
                    setIssueVillage(e.target.value)
                  }
                  placeholder="अपने ग्राम का नाम लिखें"
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                />

              </div>

              {/* TYPE */}

              <div>

                <label className="block text-sky-900 font-black mb-2">
                  विषय
                </label>

                <select
                  value={issueType}
                  onChange={(e) =>
                    setIssueType(e.target.value)
                  }
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-semibold outline-none focus:border-sky-500 focus:bg-white transition"
                >

                  <option value="समस्या">
                    🔴 समस्या
                  </option>

                  <option value="मांग">
                    🟠 मांग
                  </option>

                  <option value="सुझाव">
                    🟢 सुझाव
                  </option>

                </select>

              </div>

              {/* DETAILS */}

              <div>

                <label className="block text-sky-900 font-black mb-2">
                  समस्या / मांग / सुझाव का विवरण{" "}
                  <span className="text-red-500">*</span>
                </label>

                <textarea
                  rows={6}
                  value={issueDetails}
                  onChange={(e) =>
                    setIssueDetails(e.target.value)
                  }
                  placeholder="अपनी समस्या, मांग या सुझाव विस्तार से लिखें..."
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border-2 border-slate-200 text-slate-900 font-semibold outline-none focus:border-sky-500 focus:bg-white transition resize-none"
                />

                <p className="text-xs text-slate-500 mt-2">
                  कृपया समस्या का स्थान और आवश्यक जानकारी
                  स्पष्ट रूप से लिखें।
                </p>

              </div>

              {/* SUBMIT */}

              <button
                onClick={submitIssue}
                disabled={issueLoading}
                className="w-full py-4 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white font-black text-lg shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed"
              >

                {issueLoading
                  ? "⏳ जानकारी भेजी जा रही है..."
                  : "📨 समस्या / सुझाव भेजें"}

              </button>

              <p className="text-center text-xs text-slate-500">
                * आवश्यक जानकारी भरना जरूरी है।
              </p>

            </div>

          </div>

        </div>

      </section>

      {/* ==============================
          JAN SAMPARK
      ============================== */}

      <section
        className="relative z-10 px-5 py-16 bg-sky-200/50"
      >

        <div className="max-w-5xl mx-auto text-center">

          <h2 className="text-3xl md:text-4xl font-black text-sky-900">
            जनसंपर्क
          </h2>

          <p className="mt-6 text-slate-700 text-lg">
            ग्राम पंचायत से जुड़े विषयों और सुझावों के लिए आपसी संवाद
            एवं संपर्क को प्राथमिकता दी जाएगी।
          </p>

        </div>

      </section>

      {/* ==============================
          FOOTER
      ============================== */}

      <footer className="relative z-10 bg-sky-950 text-white border-t border-yellow-400/30 px-5 py-10">

        <div className="max-w-6xl mx-auto text-center">

          <h3 className="text-xl font-black text-yellow-300">
            ग्राम पंचायत बांसनी जोजावर
          </h3>

          <p className="mt-3 text-white/70">
            जनसेवा • पारदर्शिता • विकास • जनसंवाद
          </p>

          <p className="mt-5 text-sm text-white/50">
            © {new Date().getFullYear()} ग्राम पंचायत बांसनी जोजावर
          </p>

        </div>

      </footer>

      {/* ==================================================
          LUCKY DRAW SPIN MODAL
      ================================================== */}

      {spinOpen && (

        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 px-4">

          <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-yellow-400/30 p-6 md:p-8 shadow-2xl">

            <button
              onClick={() => setSpinOpen(false)}
              className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
            >
              ✕
            </button>

            {!selected ? (

              <>

                <div className="text-center">

                  <div className="text-5xl mb-3">
                    🎁
                  </div>

                  <h2 className="text-3xl font-black text-yellow-300">
                    Lucky Draw
                  </h2>

                  <p className="mt-3 text-white/70">
                    Spin करें और Lucky Draw में भाग लें
                  </p>

                </div>

                {/* WHEEL */}

                <div className="relative mx-auto mt-8 w-72 h-72">

                  {/* POINTER */}

                  <div className="absolute z-20 left-1/2 -translate-x-1/2 -top-4">

                    <div className="w-0 h-0 border-l-[14px] border-r-[14px] border-t-[28px] border-l-transparent border-r-transparent border-t-yellow-400" />

                  </div>

                  {/* WHEEL */}

                  <div
                    className="w-full h-full rounded-full border-8 border-yellow-300 shadow-2xl overflow-hidden"
                    style={{
                      background:
                        "conic-gradient(#ef4444 0deg 45deg, #f97316 45deg 90deg, #eab308 90deg 135deg, #22c55e 135deg 180deg, #06b6d4 180deg 225deg, #3b82f6 225deg 270deg, #8b5cf6 270deg 315deg, #ec4899 315deg 360deg)",
                      transform: `rotate(${rotation}deg)`,
                      transition: spinning
                        ? "transform 5s cubic-bezier(0.15, 0.85, 0.25, 1)"
                        : "none",
                    }}
                  >

                    {/* CENTER */}

                    <div className="absolute inset-0 flex items-center justify-center">

                      <div className="w-24 h-24 rounded-full bg-slate-950 border-4 border-yellow-300 flex items-center justify-center shadow-xl">

                        <span className="text-yellow-300 font-black text-sm">
                          LUCKY
                        </span>

                      </div>

                    </div>

                    {/* GIFTS */}

                    <div className="absolute inset-0">

                      {gifts.map((gift, index) => {

                        const angle = index * 45 + 22.5;

                        return (
                          <div
                            key={index}
                            className="absolute left-1/2 top-1/2 text-3xl"
                            style={{
                              transform: `
                                rotate(${angle}deg)
                                translateY(-105px)
                                rotate(-${angle}deg)
                              `,
                              transformOrigin: "0 0",
                            }}
                          >
                            {gift}
                          </div>
                        );

                      })}

                    </div>

                  </div>

                </div>

                {/* SPIN BUTTON */}

                <button
                  onClick={handleSpin}
                  disabled={spinning}
                  className="w-full mt-8 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-xl disabled:opacity-50"
                >

                  {spinning
                    ? "🎡 Spin हो रहा है..."
                    : "🎡 SPIN करें"}

                </button>

              </>

            ) : (

              /* RESULT */

              <div className="text-center py-8">

                <div className="text-6xl mb-5">
                  🎉
                </div>

                <h2 className="text-3xl font-black text-yellow-300">
                  Lucky Draw!
                </h2>

                <p className="mt-5 text-white/80 text-lg font-semibold leading-relaxed">
                  Gift अभी reveal नहीं किया जाएगा।
                  <br />
                  अपनी entry पूरी करने के लिए नीचे क्लिक करें।
                </p>

                <button
                  onClick={openClaim}
                  className="w-full mt-8 py-4 rounded-2xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg"
                >
                  🎁 Claim Your Gift
                </button>

              </div>

            )}

          </div>

        </div>

      )}

      {/* ==================================================
          CLAIM FORM MODAL
      ================================================== */}

      {claimOpen && (

        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/90 px-4">

          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-yellow-400/40 shadow-2xl p-6">

            {!success ? (

              <>

                {/* CLOSE */}

                <button
                  onClick={() => {
                    setClaimOpen(false);
                    setError("");
                  }}
                  className="absolute right-4 top-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white text-xl"
                >
                  ✕
                </button>

                {/* HEADER */}

                <div className="text-center mb-7">

                  <div className="text-5xl mb-3">
                    🎁
                  </div>

                  <h2 className="text-3xl font-black text-yellow-300">
                    Lucky Draw
                  </h2>

                  <p className="text-white/70 mt-2 text-sm">
                    अपनी जानकारी भरकर Entry दर्ज करें
                  </p>

                </div>

                {/* ERROR */}

                {error && (

                  <div className="mb-5 rounded-xl bg-red-500/20 border border-red-400/40 px-4 py-3 text-red-200 text-sm font-bold">
                    {error}
                  </div>

                )}

                <div className="space-y-5">

                  {/* NAME */}

                  <div>

                    <label className="block text-yellow-300 font-black mb-2">
                      नाम
                    </label>

                    <input
                      type="text"
                      placeholder="अपना नाम लिखें"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      style={{ fontWeight: 700 }}
                      className="w-full px-4 py-3 rounded-xl bg-white text-black text-base outline-none border-2 border-transparent focus:border-yellow-400 placeholder:font-bold placeholder:text-gray-600"
                    />

                  </div>

                  {/* FATHER NAME */}

                  <div>

                    <label className="block text-yellow-300 font-black mb-2">
                      पिता का नाम
                    </label>

                    <input
                      type="text"
                      placeholder="पिता का नाम लिखें"
                      value={fatherName}
                      onChange={(e) =>
                        setFatherName(e.target.value)
                      }
                      style={{ fontWeight: 700 }}
                      className="w-full px-4 py-3 rounded-xl bg-white text-black text-base outline-none border-2 border-transparent focus:border-yellow-400 placeholder:font-bold placeholder:text-gray-600"
                    />

                  </div>

                  {/* MOBILE */}

                  <div>

                    <label className="block text-yellow-300 font-black mb-2">
                      मोबाइल नंबर
                    </label>

                    <input
                      type="tel"
                      placeholder="मोबाइल नंबर लिखें"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      style={{ fontWeight: 700 }}
                      className="w-full px-4 py-3 rounded-xl bg-white text-black text-base outline-none border-2 border-transparent focus:border-yellow-400 placeholder:font-bold placeholder:text-gray-600"
                    />

                  </div>

                  {/* SUBMIT */}

                  <button
                    onClick={submitClaim}
                    disabled={submitting}
                    className="w-full py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >

                    {submitting
                      ? "Entry दर्ज हो रही है..."
                      : "🎁 Submit Entry"}

                  </button>

                  {/* CLOSE */}

                  <button
                    onClick={() => {
                      setClaimOpen(false);
                      setError("");
                    }}
                    disabled={submitting}
                    className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition"
                  >
                    बंद करें
                  </button>

                </div>

              </>

            ) : (

              /* SUCCESS */

              <div className="text-center py-8">

                <div className="text-7xl mb-5">
                  🎉
                </div>

                <h2 className="text-3xl font-black text-yellow-300">
                  बधाई हो!
                </h2>

                <p className="mt-5 text-white text-lg font-bold leading-relaxed">
                  आपका नाम Lucky Draw में
                  <br />
                  सफलतापूर्वक दर्ज हो गया है।
                </p>

                <p className="text-white/70 mt-5 text-sm leading-relaxed">
                  Lucky Draw का आयोजन चुनाव परिणाम के बाद किया जाएगा।
                  कालू राम मीणा को अपना समर्थन देने के लिए धन्यवाद!
                </p>

                <button
                  onClick={() => {
                    setClaimOpen(false);
                    setSpinOpen(false);
                    setSuccess(false);
                    setName("");
                    setFatherName("");
                    setMobile("");
                    setError("");
                  }}
                  className="w-full mt-7 py-4 rounded-xl bg-yellow-400 hover:bg-yellow-300 text-black font-black"
                >
                  ठीक है
                </button>

              </div>

            )}

          </div>

        </div>

      )}

    </main>
  );
}
