import React, { useEffect, useMemo, useState } from "react";
import {
  createSemesterCourses,
  departments,
  loadSavedSubjects,
  semesterBnNames,
  semesterNames,
  semesters,
} from "./data/catalog.js";

const facebookUrl = "https://www.facebook.com/profile.php?id=61584538482137";
const youtubeUrl = "https://www.youtube.com/@DiplomaTalentHunt";

const copy = {
  en: {
    topNote: "A brighter future starts with one new skill.",
    navAbout: "About",
    navCourses: "Courses",
    navResources: "Resources",
    navContact: "Contact",
    signIn: "Student login",
    eyebrow: "YOUR NEXT CHAPTER STARTS HERE",
    heroTitle: "Hunt your hidden skill.",
    heroText:
      "Practical courses and hand-picked study resources to help diploma students go further—with confidence.",
    explore: "Explore resources",
    ourCourses: "Discover courses",
    students: "learners growing with us",
    resourcesCount: "study resources",
    departments: "departments",
    heroNote: "Made for diploma students, built for what comes next.",
    trusted: "A little help for every big ambition",
    courseKicker: "EIGHT SEMESTERS · ALL DEPARTMENTS",
    courseTitle: "Semester-wise engineering courses",
    courseText: "Choose your department and semester. Each study pack groups the available subject guides.",
    allCourses: "Browse all semesters",
    resourceKicker: "DIPLOMA IN ENGINEERING",
    resourceTitle: "Find your next study resource",
    resourceText: "Browse subject overviews and PDF resources by department, semester, and price.",
    searchPlaceholder: "Search subjects or resources...",
    allDepartments: "All departments",
    allSemesters: "All semesters",
    anyPrice: "All resources",
    free: "Free",
    paid: "Paid",
    viewAll: "Browse all resources",
    aboutKicker: "A COMMUNITY THAT GETS IT",
    aboutTitle: "Your ambition deserves the right support.",
    aboutText:
      "Diploma Talent Hunter brings students closer to useful learning—through approachable courses, organized resources, and a community that believes in your potential.",
    mission: "Our mission",
    missionText: "Make quality learning support easier to find and easier to use.",
    vision: "Our vision",
    visionText: "A confident, skilled generation of diploma professionals.",
    activity: "What we do",
    activityText: "Curate study PDFs, share practical learning, and help students grow.",
    stepsKicker: "SIMPLE BY DESIGN",
    stepsTitle: "From curious to confident",
    stepOne: "Create your account",
    stepOneText: "Join the DTH student community.",
    stepTwo: "Find your fit",
    stepTwoText: "Choose a course or filter resources by semester.",
    stepThree: "Learn your way",
    stepThreeText: "Access your study materials and keep moving forward.",
    ctaTitle: "Your next skill is closer than you think.",
    ctaText: "Take a look around and find the thing that gets you started.",
    ctaButton: "Start exploring",
    contactTitle: "Say hello",
    contactText: "Questions, ideas, or just want to connect? We’re here.",
    quickLinks: "Explore",
    legal: "The important bits",
    privacy: "Privacy policy",
    terms: "Terms & conditions",
    refunds: "Refund policy",
    copyright: "Copyright policy",
    disclaimer: "Disclaimer",
    rights: "© 2025 Diploma Talent Hunter. Made for learners, with care.",
    resource: "Resource",
    course: "Course",
    enroll: "Explore course",
    getResource: "Get resource",
    freeTag: "FREE",
    perMonth: "/ course",
    noResults: "No resources match those filters yet.",
    resetFilters: "Clear filters",
    catalogNotice: "Starter catalogue: sample subject names and overviews need verification against your BTEB regulation. An admin can add or remove items.",
    manageCatalog: "Manage catalogue",
    semesterCourse: "Semester course",
    semesterCourses: "semester courses",
    courseDetails: "Course details",
    viewCourse: "View course details",
    backToCourses: "Back to courses",
    whatYouLearn: "What you’ll study",
    courseUnavailable: "This course could not be found.",
    paymentServiceUnavailable: "The payment API is offline. Start the API and configure PostgreSQL and bKash credentials in .env. No payment was taken.",
    department: "Department",
    semester: "Semester",
    subjectOverview: "Subject overview",
    includedSubjects: "Included subject guides",
    adminTitle: "Manage subject catalogue",
    adminNote: "Enter the server's admin key to save catalogue changes. API keys stay in memory and are never saved in this browser.",
    adminKey: "Server admin API key",
    addSubject: "Add subject",
    subjectName: "Subject name (English)",
    subjectNameBn: "Subject name (Bangla)",
    subjectDescription: "Subject overview",
    driveUrl: "Google Drive PDF link (optional)",
    saveSubject: "Save subject",
    updateSubject: "Update subject",
    deleteSubject: "Delete",
    noAdminSubjects: "No subjects match the selected department and semester.",
    saveSuccess: "Subject saved in this browser.",
    deleteConfirm: "Remove this subject from this browser's catalogue?",
    driveLinkHint: "Drive link is kept hidden from students until a verified payment is delivered by the backend.",
    purchaseButton: "Continue with bKash",
    freeResourceButton: "Get free PDF",
    freeAccessUnavailable: "The free PDF link could not be issued. No download link was shared; the resource service is not connected.",
    receiptTitle: "Your learning resource is ready",
    receiptSubtitle: "Payment verified. Your purchased study materials are listed below.",
    receiptLoading: "Loading your purchase details…",
    receiptPending: "Your payment is still being verified. The PDF link will appear here after bKash confirms payment.",
    receiptFailed: "This payment was not completed. No download link has been issued.",
    receiptInvalid: "This purchase link is invalid or has expired. Contact DTH if your payment was successful.",
    receiptCancelled: "Payment was cancelled. No payment or download was recorded.",
    receiptRetry: "Check payment again",
    transactionId: "bKash transaction",
    invoiceNumber: "Order number",
    viewPdf: "Open Google Drive PDF",
    pdfUnavailable: "The admin has not added a Google Drive PDF link for this item yet.",
    paidAmount: "Amount paid",
    coursesMaterial: "Included course resources",
    subject: "Subject",
    checkoutUnavailable: "bKash checkout did not start. No payment was taken. The secure payment backend and merchant credentials are not connected.",
    checkoutError: "bKash checkout could not start. No payment was taken.",
    previousPage: "Previous",
    nextPage: "Next",
    page: "Page",
    fromTo: "of",
  },
  bn: {
    topNote: "একটি নতুন দক্ষতাই হোক উজ্জ্বল ভবিষ্যতের শুরু।",
    navAbout: "আমাদের সম্পর্কে",
    navCourses: "কোর্স",
    navResources: "রিসোর্স",
    navContact: "যোগাযোগ",
    signIn: "শিক্ষার্থী লগইন",
    eyebrow: "আপনার নতুন অধ্যায় শুরু হোক এখানে",
    heroTitle: "খুঁজে নিন আপনার লুকানো প্রতিভা।",
    heroText:
      "ডিপ্লোমা শিক্ষার্থীদের আত্মবিশ্বাসের সঙ্গে এগিয়ে নিতে হাতে বাছাই করা রিসোর্স ও ব্যবহারিক কোর্স।",
    explore: "রিসোর্স দেখুন",
    ourCourses: "কোর্স দেখুন",
    students: "শিক্ষার্থী এগিয়ে যাচ্ছে",
    resourcesCount: "টি পড়ার রিসোর্স",
    departments: "টি বিভাগ",
    heroNote: "ডিপ্লোমা শিক্ষার্থীদের জন্য, আগামীর কথা ভেবে।",
    trusted: "প্রতিটি বড় স্বপ্নের পাশে ছোট্ট সহায়তা",
    courseKicker: "৮টি পর্ব · সব বিভাগ",
    courseTitle: "সেমিস্টারভিত্তিক ইঞ্জিনিয়ারিং কোর্স",
    courseText: "বিভাগ ও পর্ব বেছে নিন। প্রতিটি স্টাডি প্যাকে ওই পর্বের বিষয়ের গাইড থাকবে।",
    allCourses: "সব পর্ব দেখুন",
    resourceKicker: "ডিপ্লোমা ইন ইঞ্জিনিয়ারিং",
    resourceTitle: "খুঁজে নিন পরের পড়ার রিসোর্স",
    resourceText: "বিভাগ, পর্ব ও মূল্য অনুযায়ী বিষয়ের পরিচিতি এবং PDF খুঁজুন।",
    searchPlaceholder: "বিষয় বা রিসোর্স খুঁজুন...",
    allDepartments: "সব বিভাগ",
    allSemesters: "সব পর্ব",
    anyPrice: "সব রিসোর্স",
    free: "ফ্রি",
    paid: "পেইড",
    viewAll: "সব রিসোর্স দেখুন",
    aboutKicker: "বোঝে এমন একটি কমিউনিটি",
    aboutTitle: "আপনার স্বপ্নের পাশে থাকুক সঠিক সহায়তা।",
    aboutText:
      "সহজবোধ্য কোর্স, সাজানো রিসোর্স এবং আপনার সম্ভাবনায় বিশ্বাসী একটি কমিউনিটির মাধ্যমে Diploma Talent Hunter শিক্ষার্থীদের শেখার পথে সহায়তা করে।",
    mission: "আমাদের লক্ষ্য",
    missionText: "মানসম্মত শেখার সহায়তা সহজে খুঁজে পাওয়া ও ব্যবহার করা।",
    vision: "আমাদের স্বপ্ন",
    visionText: "আত্মবিশ্বাসী ও দক্ষ ডিপ্লোমা পেশাজীবীর একটি প্রজন্ম।",
    activity: "আমাদের কাজ",
    activityText: "পিডিএফ সাজানো, ব্যবহারিক শেখা এবং শিক্ষার্থীদের এগিয়ে নেওয়া।",
    stepsKicker: "সহজ ও সরল",
    stepsTitle: "আগ্রহ থেকে আত্মবিশ্বাসে",
    stepOne: "অ্যাকাউন্ট খুলুন",
    stepOneText: "DTH শিক্ষার্থী কমিউনিটিতে যুক্ত হোন।",
    stepTwo: "আপনার পছন্দ খুঁজুন",
    stepTwoText: "কোর্স বাছুন অথবা পর্ব অনুযায়ী রিসোর্স খুঁজুন।",
    stepThree: "নিজের মতো শিখুন",
    stepThreeText: "পড়ার উপকরণ নিন, এগিয়ে চলুন।",
    ctaTitle: "আপনার পরের দক্ষতাটি খুব কাছেই।",
    ctaText: "একবার ঘুরে দেখুন, শুরু করার মতো কিছু নিশ্চয়ই পাবেন।",
    ctaButton: "ঘুরে দেখুন",
    contactTitle: "কথা বলুন",
    contactText: "প্রশ্ন, পরামর্শ বা যোগাযোগ—আমরা আছি।",
    quickLinks: "ঘুরে দেখুন",
    legal: "প্রয়োজনীয় তথ্য",
    privacy: "গোপনীয়তা নীতি",
    terms: "শর্তাবলি",
    refunds: "রিফান্ড নীতি",
    copyright: "কপিরাইট নীতি",
    disclaimer: "দায়মুক্তি",
    rights: "© ২০২৫ Diploma Talent Hunter। শিক্ষার্থীদের জন্য, যত্ন নিয়ে।",
    resource: "রিসোর্স",
    course: "কোর্স",
    enroll: "কোর্স দেখুন",
    getResource: "রিসোর্স নিন",
    freeTag: "ফ্রি",
    perMonth: "/ কোর্স",
    noResults: "এই ফিল্টারে কোনো রিসোর্স পাওয়া যায়নি।",
    resetFilters: "ফিল্টার মুছুন",
    catalogNotice: "প্রাথমিক ক্যাটালগ: বিষয়ের নাম ও পরিচিতি আপনার BTEB প্রবিধানের সঙ্গে যাচাই করুন। অ্যাডমিন বিষয় যোগ বা মুছতে পারবেন।",
    manageCatalog: "ক্যাটালগ পরিচালনা",
    semesterCourse: "সেমিস্টার কোর্স",
    semesterCourses: "টি সেমিস্টার কোর্স",
    courseDetails: "কোর্সের বিস্তারিত",
    viewCourse: "কোর্সের বিস্তারিত দেখুন",
    backToCourses: "কোর্সে ফিরে যান",
    whatYouLearn: "এই কোর্সে যা শিখবেন",
    courseUnavailable: "কোর্সটি খুঁজে পাওয়া যায়নি।",
    paymentServiceUnavailable: "পেমেন্ট API চালু নেই। API চালু করে .env-এ PostgreSQL ও bKash ক্রেডেনশিয়াল কনফিগার করুন। কোনো পেমেন্ট নেওয়া হয়নি।",
    department: "বিভাগ",
    semester: "পর্ব",
    subjectOverview: "বিষয়ের পরিচিতি",
    includedSubjects: "অন্তর্ভুক্ত বিষয়ের গাইড",
    adminTitle: "বিষয় ক্যাটালগ পরিচালনা",
    adminNote: "ক্যাটালগ পরিবর্তন সেভ করতে সার্ভারের admin key দিন। API key ব্রাউজারে সেভ হবে না।",
    adminKey: "সার্ভার admin API key",
    addSubject: "বিষয় যোগ করুন",
    subjectName: "বিষয়ের নাম (ইংরেজি)",
    subjectNameBn: "বিষয়ের নাম (বাংলা)",
    subjectDescription: "বিষয়ের পরিচিতি",
    driveUrl: "Google Drive PDF লিংক (ঐচ্ছিক)",
    saveSubject: "বিষয় সেভ করুন",
    updateSubject: "বিষয় আপডেট করুন",
    deleteSubject: "মুছুন",
    noAdminSubjects: "নির্বাচিত বিভাগ ও পর্বে কোনো বিষয় নেই।",
    saveSuccess: "বিষয়টি এই ব্রাউজারে সেভ হয়েছে।",
    deleteConfirm: "এই ব্রাউজারের ক্যাটালগ থেকে বিষয়টি মুছবেন?",
    driveLinkHint: "ব্যাকএন্ড পেমেন্ট যাচাই করে ডেলিভারি না করা পর্যন্ত Drive link শিক্ষার্থীদের দেখানো হবে না।",
    purchaseButton: "bKash-এ পেমেন্ট করুন",
    freeResourceButton: "ফ্রি PDF নিন",
    freeAccessUnavailable: "ফ্রি PDF লিংক দেওয়া যায়নি। কোনো ডাউনলোড লিংক শেয়ার করা হয়নি; রিসোর্স সার্ভিস সংযুক্ত নেই।",
    receiptTitle: "আপনার পড়ার উপকরণ প্রস্তুত",
    receiptSubtitle: "পেমেন্ট যাচাই হয়েছে। কেনা পড়ার উপকরণগুলো নিচে দেখুন।",
    receiptLoading: "কেনার তথ্য আনা হচ্ছে…",
    receiptPending: "আপনার পেমেন্ট যাচাই হচ্ছে। bKash নিশ্চিত করলে PDF লিংক এখানে দেখানো হবে।",
    receiptFailed: "পেমেন্ট সম্পন্ন হয়নি। কোনো ডাউনলোড লিংক দেওয়া হয়নি।",
    receiptInvalid: "এই ক্রয়-লিংকটি ভুল বা মেয়াদ শেষ। পেমেন্ট হয়ে থাকলে DTH-তে যোগাযোগ করুন।",
    receiptCancelled: "পেমেন্ট বাতিল হয়েছে। কোনো টাকা বা ডাউনলোড রেকর্ড করা হয়নি।",
    receiptRetry: "পেমেন্ট আবার যাচাই করুন",
    transactionId: "bKash ট্রানজ্যাকশন",
    invoiceNumber: "অর্ডার নম্বর",
    viewPdf: "Google Drive PDF খুলুন",
    pdfUnavailable: "অ্যাডমিন এখনও এই বিষয়ে Google Drive PDF লিংক যোগ করেননি।",
    paidAmount: "পরিশোধিত মূল্য",
    coursesMaterial: "কোর্সের অন্তর্ভুক্ত উপকরণ",
    subject: "বিষয়",
    checkoutUnavailable: "bKash checkout চালু হয়নি। কোনো পেমেন্ট নেওয়া হয়নি। নিরাপদ পেমেন্ট ব্যাকএন্ড ও মার্চেন্ট ক্রেডেনশিয়াল সংযুক্ত নেই।",
    checkoutError: "bKash checkout চালু করা যায়নি। কোনো পেমেন্ট নেওয়া হয়নি।",
    previousPage: "আগের",
    nextPage: "পরের",
    page: "পৃষ্ঠা",
    fromTo: "/",
  },
};

const policyText = {
  en: {
    privacy:
      "We only collect information needed to provide student services. Never share your password or payment details with anyone.",
    terms:
      "Use DTH resources for personal learning. Course and resource details may change as our learning library grows.",
    refunds:
      "Please review resource details before purchase. Contact us with your order information if a purchased resource is unavailable or incorrect.",
    copyright:
      "Learning materials belong to their respective creators. Contact us if you believe content has been shared in error.",
    disclaimer:
      "DTH learning resources are provided for educational support and do not replace official institutional guidance.",
  },
  bn: {
    privacy:
      "শিক্ষার্থীসেবা দেওয়ার প্রয়োজনীয় তথ্যই আমরা সংগ্রহ করি। কারও সঙ্গে পাসওয়ার্ড বা পেমেন্টের তথ্য শেয়ার করবেন না।",
    terms:
      "DTH-এর রিসোর্স ব্যক্তিগত পড়াশোনার জন্য ব্যবহার করুন। লাইব্রেরি বড় হওয়ার সঙ্গে কোর্স ও রিসোর্সের তথ্য পরিবর্তিত হতে পারে।",
    refunds:
      "কেনার আগে রিসোর্সের বিবরণ দেখে নিন। কেনা রিসোর্স না পেলে বা ভুল থাকলে অর্ডারের তথ্যসহ আমাদের জানান।",
    copyright:
      "শিক্ষাসামগ্রী তার নিজ নিজ নির্মাতার সম্পত্তি। কোনো কনটেন্ট ভুলভাবে শেয়ার হয়েছে মনে হলে আমাদের জানান।",
    disclaimer:
      "DTH-এর শিক্ষাসামগ্রী পড়াশোনার সহায়তার জন্য; এটি প্রতিষ্ঠানের আনুষ্ঠানিক নির্দেশনার বিকল্প নয়।",
  },
};

function Logo({ footer = false }) {
  return (
    <a className={`brand ${footer ? "brand-footer" : ""}`} href={window.location.pathname === "/" ? "#home" : "/"} aria-label="Diploma Talent Hunter home">
      <img className="brand-image" src="/dth-logo.svg" alt="" />
      <span className="brand-copy">
        <strong>DTH</strong>
        <small>Diploma Talent Hunter</small>
      </span>
    </a>
  );
}

function CourseArtwork({ course, departmentInfo, large = false }) {
  const palettes = [
    ["#e6efdc", "#2c573f", "#c5df91"],
    ["#e8e4f0", "#4d476b", "#c7b9dd"],
    ["#f1e7dc", "#77553e", "#e7c395"],
    ["#dfecef", "#365d66", "#a9d2d3"],
  ];
  const departmentIndex = departments.findIndex((department) => department.id === course.department);
  const [paper, ink, accent] = palettes[(departmentIndex + course.semester - 1) % palettes.length];
  const semesterLabel = semesterNames[course.semester - 1];

  return (
    <div
      className={`course-art${large ? " course-art-large" : ""}`}
      style={{ "--art-paper": paper, "--art-ink": ink, "--art-accent": accent }}
      role="img"
      aria-label={`${departmentInfo?.name || "Engineering"} ${semesterLabel} semester course illustration`}
    >
      <div className="course-art-label">
        <span>DTH · FIELD NOTES</span>
        <strong>{departmentInfo?.focus || "Engineering"}</strong>
        <small>{semesterLabel} semester · study collection</small>
      </div>
      <svg className="course-art-illustration" viewBox="0 0 300 190" aria-hidden="true">
        <circle className="art-orbit" cx="156" cy="93" r="73" />
        <circle className="art-orbit art-orbit-inner" cx="156" cy="93" r="56" />
        <circle className="art-sun" cx="220" cy="38" r="18" />
        <path className="art-book-shadow" d="M56 133c27-15 51-15 76 0 24-15 49-15 75 0v31c-26-14-51-14-75 0-25-14-49-14-76 0z" />
        <path className="art-book" d="M56 126c27-15 51-15 76 0 24-15 49-15 75 0v31c-26-14-51-14-75 0-25-14-49-14-76 0z" />
        <path className="art-book-line" d="M132 127v30m-61-22c12-5 24-7 36-4m39 4c12-4 24-2 36 3" />
        <rect className="art-icon-tile" x="116" y="52" width="80" height="65" rx="20" />
        <text className="art-icon" x="156" y="96" textAnchor="middle">{course.icon}</text>
        <path className="art-spark" d="m75 63 4 11 11 4-11 4-4 11-4-11-11-4 11-4z" />
        <circle className="art-dot" cx="235" cy="113" r="4" />
        <circle className="art-dot" cx="86" cy="116" r="3" />
      </svg>
      <span className="course-art-number">{String(course.semester).padStart(2, "0")} / 08</span>
    </div>
  );
}

function ArrowIcon() {
  return <span aria-hidden="true">↗</span>;
}

function CourseDetailsPage({ course, departmentInfo, language, onLanguageToggle, onPurchase, checkoutPending, message }) {
  const t = copy[language];
  const title = language === "bn" ? course.bnTitle : course.title;
  const description = language === "bn" ? course.bnDescription : course.description;

  return (
    <div className="course-details-page" lang={language === "bn" ? "bn" : "en"}>
      <header className="course-details-header">
        <Logo />
        <div className="course-details-header-actions">
          <a className="course-back-link" href="/#courses">← {t.backToCourses}</a>
          <button className="language-toggle" onClick={onLanguageToggle} aria-label={language === "en" ? "Switch to Bangla" : "Switch to English"}>
            <span className={language === "en" ? "language-active" : ""}>EN</span>
            <span className="language-divider">/</span>
            <span className={language === "bn" ? "language-active" : ""}>বাং</span>
          </button>
        </div>
      </header>
      <main className="course-details-main">
        <a className="course-details-back-mobile" href="/#courses">← {t.backToCourses}</a>
        <section className="course-details-hero">
          <div className="course-details-copy">
            <p className="eyebrow">{t.courseDetails} · {language === "bn" ? departmentInfo?.bnName : departmentInfo?.name}</p>
            <h1>{title}</h1>
            <p className="course-details-description">{description}</p>
            <div className="course-detail-facts">
              <span>{language === "bn" ? `${semesterBnNames[course.semester - 1]} ${t.semester}` : `${semesterNames[course.semester - 1]} semester`}</span>
              <span>{course.subjects.length} {language === "bn" ? "টি বিষয়" : "subject guides"}</span>
              <strong>৳ {course.price.toLocaleString("en-BD")}</strong>
            </div>
            <button className="button button-dark course-purchase-button" disabled={checkoutPending} onClick={() => onPurchase(course)}>
              {checkoutPending ? (language === "bn" ? "অপেক্ষা করুন..." : "Please wait...") : t.purchaseButton}<ArrowIcon />
            </button>
            {message && <p className="course-checkout-message" role="status">{message}</p>}
          </div>
          <CourseArtwork course={course} departmentInfo={departmentInfo} large />
        </section>
        <section className="course-details-content">
          <div>
            <p className="eyebrow">{t.whatYouLearn}</p>
            <h2>{t.includedSubjects}</h2>
            <p>{description}</p>
          </div>
          <ol className="course-subject-list">
            {course.subjects.map((subject, index) => (
              <li key={subject.id}>
                <span className="course-subject-number">{String(index + 1).padStart(2, "0")}</span>
                <span>{language === "bn" ? subject.bnTitle : subject.title}</span>
                <span className="course-subject-arrow" aria-hidden="true">↗</span>
              </li>
            ))}
          </ol>
        </section>
        <aside className="course-details-bottom">
          <span>{language === "bn" ? "আপনার পরের অধ্যায় শুরু হোক এখান থেকে" : "A thoughtful start to your next semester."}</span>
          <button className="button button-dark" onClick={() => onPurchase(course)}>{t.purchaseButton}<ArrowIcon /></button>
        </aside>
      </main>
      <footer className="payment-footer">DIPLOMA TALENT HUNTER · HUNT YOUR HIDDEN SKILL</footer>
    </div>
  );
}

function PurchaseDetailsPage({ language }) {
  const [purchase, setPurchase] = useState(null);
  const [status, setStatus] = useState("loading");
  const [checking, setChecking] = useState(false);
  const [message, setMessage] = useState("");
  const t = copy[language];
  const [purchaseId, setPurchaseId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("purchase") || "";
    const statusParam = params.get("status") || "";
    const urlAccessKey = params.get("accessKey") || "";
    setPurchaseId(id);

    let accessKey = urlAccessKey;
    if (id) {
      try {
        if (urlAccessKey) window.sessionStorage.setItem(`dth-purchase-${id}`, urlAccessKey);
        else accessKey = window.sessionStorage.getItem(`dth-purchase-${id}`) || "";
      } catch (error) {
        console.error("Could not save the purchase access key in this browser session.", error);
      }
    }
    window.history.replaceState(null, "", `/payment/details${id ? `?purchase=${encodeURIComponent(id)}` : ""}`);

    let active = true;
    async function loadPurchase() {
      if (!id) {
        setStatus(statusParam === "cancelled" ? "cancelled" : statusParam || "invalid");
        setMessage("");
        return;
      }
      if (!accessKey) {
        setStatus("invalid");
        return;
      }
      setChecking(true);
      try {
        const headers = { Authorization: `Bearer ${accessKey}`, Accept: "application/json" };
        let response = await fetch(`/api/purchases/${encodeURIComponent(id)}`, { headers, cache: "no-store" });
        if (!response.ok) {
          if (response.status === 404) {
            setStatus("invalid");
            return;
          }
          throw new Error(`Purchase lookup returned HTTP ${response.status}.`);
        }
        let result = await response.json();
        if (result.status === "PENDING" && statusParam === "pending") {
          await new Promise((resolve) => window.setTimeout(resolve, 1200));
          response = await fetch(`/api/purchases/${encodeURIComponent(id)}/verify`, {
            method: "POST",
            headers,
            cache: "no-store",
          });
          if (!response.ok) {
            if (response.status === 404) {
              setStatus("invalid");
              return;
            }
            throw new Error(`Payment verification returned HTTP ${response.status}.`);
          }
          result = await response.json();
        }
        if (active) {
          setPurchase(result.status === "PAID" ? result : null);
          setStatus(result.status || "invalid");
        }
      } catch (error) {
        console.error("Could not load the purchase details.", error);
        if (active) {
          setStatus("error");
          setMessage(language === "bn" ? "কেনার তথ্য আনা যায়নি। আবার চেষ্টা করুন।" : "Could not load your purchase. Please try again.");
        }
      } finally {
        if (active) setChecking(false);
      }
    }
    loadPurchase();
    return () => { active = false; };
  }, [language]);

  async function retryPaymentCheck() {
    if (!purchaseId) return;
    setChecking(true);
    try {
      const accessKey = window.sessionStorage.getItem(`dth-purchase-${purchaseId}`);
      if (!accessKey) {
        setStatus("invalid");
        return;
      }
      const response = await fetch(`/api/purchases/${encodeURIComponent(purchaseId)}/verify`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessKey}`, Accept: "application/json" },
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error(`Payment verification returned HTTP ${response.status}.`);
      }
      const result = await response.json();
      setPurchase(result.status === "PAID" ? result : null);
      setStatus(result.status || "invalid");
    } catch (error) {
      console.error("Could not verify the purchase payment.", error);
      setMessage(language === "bn" ? "পেমেন্ট যাচাই করা যায়নি। পরে আবার চেষ্টা করুন।" : "Payment could not be verified. Please retry shortly.");
    } finally {
      setChecking(false);
    }
  }

  const description = language === "bn" ? purchase?.bnDescription : purchase?.description;
  const heading = purchase ? (language === "bn" ? purchase.bnTitle : purchase.title) : "";

  return (
    <div className="payment-page" lang={language === "bn" ? "bn" : "en"}>
      <header className="payment-header"><Logo /></header>
      <main className="payment-main">
        <div className={`payment-status-icon payment-status-${status}`} aria-hidden="true">
          {status === "PAID" ? "✓" : status === "PENDING" || status === "loading" ? "…" : "!"}
        </div>
        <p className="eyebrow">{status === "PAID" ? "DTH · PAYMENT VERIFIED" : "DTH · SECURE CHECKOUT"}</p>
        <h1>{status === "PAID" ? t.receiptTitle : status === "PENDING" ? t.receiptPending : status === "loading" ? t.receiptLoading : status === "cancelled" ? t.receiptCancelled : status === "FAILED" ? t.receiptFailed : status === "error" ? message : t.receiptInvalid}</h1>
        {status === "PAID" && (
          <>
            <p className="payment-description">{t.receiptSubtitle}</p>
            <article className="purchase-summary">
              <p className="eyebrow">{purchase.productType === "course" ? t.semesterCourse : t.subject}</p>
              <h2>{heading}</h2>
              <p>{description}</p>
              <dl>
                <div><dt>{t.paidAmount}</dt><dd>৳ {purchase.amount}</dd></div>
                <div><dt>{t.invoiceNumber}</dt><dd>{purchase.invoiceNumber}</dd></div>
                {purchase.transactionId && <div><dt>{t.transactionId}</dt><dd>{purchase.transactionId}</dd></div>}
              </dl>
            </article>
            <section className="purchase-files">
              <h2>{purchase.productType === "course" ? t.coursesMaterial : t.subjectOverview}</h2>
              {purchase.files.map((file) => (
                <article className="purchase-file" key={`${file.title}-${file.driveUrl}`}>
                  <div><strong>{language === "bn" ? file.bnTitle : file.title}</strong></div>
                  {file.driveUrl && (
                    <a className="button button-dark" href={file.driveUrl} target="_blank" rel="noopener noreferrer" referrerPolicy="no-referrer">
                      {t.viewPdf}<ArrowIcon />
                    </a>
                  )}
                  {!file.driveUrl && <p className="admin-hint">{t.pdfUnavailable}</p>}
                </article>
              ))}
            </section>
          </>
        )}
        {status === "PENDING" && (
          <>
            <p className="payment-description">{t.receiptPending}</p>
            <button className="button button-dark" disabled={checking} onClick={retryPaymentCheck}>
              {checking ? (language === "bn" ? "যাচাই হচ্ছে..." : "Checking...") : t.receiptRetry}
            </button>
          </>
        )}
        {status === "loading" && <p className="payment-description">{t.receiptLoading}</p>}
        {message && status !== "error" && <p className="form-message" role="status">{message}</p>}
        <a className="payment-home-link" href="/">{language === "bn" ? "DTH-তে ফিরে যান" : "Back to Diploma Talent Hunter"}<ArrowIcon /></a>
      </main>
      <footer className="payment-footer">DIPLOMA TALENT HUNTER · HUNT YOUR HIDDEN SKILL</footer>
    </div>
  );
}

function isGoogleDriveUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" &&
      (url.hostname === "drive.google.com" || url.hostname === "docs.google.com");
  } catch {
    return false;
  }
}

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-backdrop" onMouseDown={onClose}>
      <section
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button className="modal-close" onClick={onClose} aria-label="Close dialog">
          ×
        </button>
        <p className="eyebrow">DIPLOMA TALENT HUNTER</p>
        <h2 id="modal-title">{title}</h2>
        {children}
      </section>
    </div>
  );
}

function App() {
  const [language, setLanguage] = useState(() => {
    try {
      return window.localStorage.getItem("dth-language") === "bn" ? "bn" : "en";
    } catch (error) {
      console.error("Could not load the saved DTH language preference.", error);
      return "en";
    }
  });
  const [catalogItems, setCatalogItems] = useState(loadSavedSubjects);
  const [serverCourses, setServerCourses] = useState([]);
  const [adminKey, setAdminKey] = useState("");
  const [department, setDepartment] = useState("");
  const [semester, setSemester] = useState("");
  const [priceFilter, setPriceFilter] = useState("");
  const [search, setSearch] = useState("");
  const [resourcePage, setResourcePage] = useState(1);
  const [courseDepartment, setCourseDepartment] = useState("");
  const [courseSemester, setCourseSemester] = useState("");
  const [coursePage, setCoursePage] = useState(1);
  const [adminDepartment, setAdminDepartment] = useState("computer");
  const [adminSemester, setAdminSemester] = useState(1);
  const [modal, setModal] = useState(null);
  const [authMode, setAuthMode] = useState("login");
  const [message, setMessage] = useState("");
  const [adminStatus, setAdminStatus] = useState("");
  const [checkoutPending, setCheckoutPending] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const coursePath = window.location.pathname.match(/^\/courses\/([^/]+)\/?$/);
  const t = copy[language];
  const legal = policyText[language];
  const pageSize = 8;

  useEffect(() => {
    try {
      window.localStorage.setItem("dth-language", language);
    } catch (error) {
      console.error("Could not save the DTH language preference.", error);
    }
  }, [language]);

  useEffect(() => {
    try {
      window.localStorage.setItem("dth-subject-catalog", JSON.stringify(catalogItems));
    } catch (error) {
      console.error("Could not save the DTH subject catalogue in this browser.", error);
      setAdminStatus(language === "bn"
        ? "ক্যাটালগ এই ব্রাউজারে সেভ করা যায়নি।"
        : "The catalogue could not be saved in this browser.");
    }
  }, [catalogItems, language]);

  useEffect(() => {
    let active = true;
    fetch("/api/catalog", { headers: { Accept: "application/json" } })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error(`Catalogue request failed with HTTP ${response.status}.`);
        }
        return response.json();
      })
      .then((catalog) => {
        if (!Array.isArray(catalog.subjects) || !Array.isArray(catalog.courses)) {
          throw new Error("Catalogue response did not contain subjects and courses.");
        }
        if (active) {
          setCatalogItems(catalog.subjects.map((subject) => ({ ...subject, driveUrl: subject.driveUrl || "" })));
          setServerCourses(catalog.courses);
        }
      })
      .catch((error) => {
        console.error("Could not load the PostgreSQL DTH catalogue; keeping the local starter catalogue.", error);
      });
    return () => { active = false; };
  }, []);

  const filteredResources = useMemo(() => {
    const query = search.trim().toLowerCase();
    return catalogItems.filter((resource) => {
      const matchesDepartment = !department || resource.department === department;
      const matchesSemester = !semester || resource.semester === Number(semester);
      const matchesPrice =
        !priceFilter ||
        (priceFilter === "free" ? resource.price === 0 : resource.price > 0);
      const departmentName = departments.find((entry) => entry.id === resource.department)?.name || "";
      const matchesSearch =
        !query ||
        `${resource.title} ${resource.bnTitle} ${resource.subject} ${resource.bnSubject} ${departmentName}`
          .toLowerCase()
          .includes(query);
      return matchesDepartment && matchesSemester && matchesPrice && matchesSearch;
    });
  }, [catalogItems, department, priceFilter, search, semester]);
  const visibleResources = filteredResources.slice((resourcePage - 1) * pageSize, resourcePage * pageSize);
  const resourcePageCount = Math.max(1, Math.ceil(filteredResources.length / pageSize));

  const semesterCourses = useMemo(
    () => serverCourses.length ? serverCourses : createSemesterCourses(catalogItems),
    [catalogItems, serverCourses],
  );
  const filteredCourses = useMemo(
    () => semesterCourses.filter((course) =>
      (!courseDepartment || course.department === courseDepartment) &&
      (!courseSemester || course.semester === Number(courseSemester)),
    ),
    [courseDepartment, courseSemester, semesterCourses],
  );
  const visibleCourses = filteredCourses.slice((coursePage - 1) * pageSize, coursePage * pageSize);
  const coursePageCount = Math.max(1, Math.ceil(filteredCourses.length / pageSize));
  const adminSubjects = catalogItems.filter(
    (subject) => subject.department === adminDepartment && subject.semester === Number(adminSemester),
  );

  function openAuth(mode = "login") {
    setAuthMode(mode);
    setMessage("");
    setModal({ type: "auth" });
  }

  function openResource(resource) {
    setMessage("");
    setModal({ type: "resource", item: resource });
  }

  function openAdmin() {
    setAdminStatus("");
    setModal({ type: "admin" });
  }

  async function saveAdminChange(endpoint, method, data) {
    if (adminKey.length < 32) {
      setAdminStatus(language === "bn"
        ? "অ্যাডমিন পরিবর্তন সেভ করতে server-এর ADMIN_API_KEY দিন।"
        : "Enter the server's ADMIN_API_KEY to save catalogue changes.");
      return null;
    }
    let response;
    try {
      response = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          "X-Admin-Key": adminKey,
        },
        ...(data === undefined ? {} : { body: JSON.stringify(data) }),
      });
    } catch (error) {
      console.error("Could not connect to the admin catalogue API.", error);
      setAdminStatus(language === "bn" ? "অ্যাডমিন API-তে সংযোগ করা যায়নি।" : "Could not reach the admin catalogue API.");
      return null;
    }
    let result;
    try {
      result = await response.json();
    } catch (error) {
      console.error("The admin catalogue API returned invalid JSON.", error);
      setAdminStatus(language === "bn" ? "অ্যাডমিন API-এর উত্তর পড়া যায়নি।" : "The admin API returned an invalid response.");
      return null;
    }
    if (!response.ok) {
      console.error("Admin catalogue update was rejected.", result.error);
      setAdminStatus(result.error || (language === "bn" ? "ক্যাটালগ পরিবর্তন সেভ হয়নি।" : "Catalogue change was not saved."));
      return null;
    }
    if (method !== "GET") {
      try {
        const catalogResponse = await fetch("/api/catalog", { cache: "no-store" });
        if (!catalogResponse.ok) throw new Error(`Catalogue refresh returned HTTP ${catalogResponse.status}.`);
        const catalog = await catalogResponse.json();
        if (!Array.isArray(catalog.subjects) || !Array.isArray(catalog.courses)) {
          throw new Error("Catalogue refresh returned invalid data.");
        }
        setCatalogItems(catalog.subjects.map((subject) => ({ ...subject, driveUrl: subject.driveUrl || "" })));
        setServerCourses(catalog.courses);
      } catch (error) {
        console.error("The admin update succeeded but the public catalogue could not be refreshed.", error);
        setAdminStatus(language === "bn"
          ? "পরিবর্তন সেভ হয়েছে, কিন্তু ক্যাটালগ রিফ্রেশ করা যায়নি।"
          : "The change was saved, but the public catalogue could not be refreshed.");
      }
    }
    return result;
  }

  async function handleAddSubject(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const title = String(formData.get("title") || "").trim();
    const bnTitle = String(formData.get("bnTitle") || "").trim();
    const overview = String(formData.get("overview") || "").trim();
    const bnOverview = String(formData.get("bnOverview") || "").trim();
    const departmentId = String(formData.get("department") || "");
    const semesterNumber = Number(formData.get("semester"));
    const price = Number(formData.get("price"));
    const driveUrl = String(formData.get("driveUrl") || "").trim();
    const selectedDepartment = departments.find((entry) => entry.id === departmentId);

    if (!selectedDepartment || !Number.isInteger(semesterNumber) || semesterNumber < 1 || semesterNumber > 8) {
      setAdminStatus(language === "bn" ? "বিভাগ ও পর্ব সঠিকভাবে নির্বাচন করুন।" : "Choose a valid department and semester.");
      return;
    }
    if (driveUrl && !isGoogleDriveUrl(driveUrl)) {
      setAdminStatus(language === "bn" ? "শুধু Google Drive বা Google Docs লিংক যোগ করা যাবে।" : "Only Google Drive or Google Docs links are accepted.");
      return;
    }

    const subject = {
      id: `admin-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`}`,
      title,
      bnTitle,
      subject: `${selectedDepartment.name} · ${semesterNames[semesterNumber - 1]} semester`,
      bnSubject: `${selectedDepartment.bnName} · ${semesterBnNames[semesterNumber - 1]} পর্ব`,
      overview,
      bnOverview,
      department: departmentId,
      semester: semesterNumber,
      price,
      icon: selectedDepartment.icon,
      tint: "green",
      driveUrl,
      isStarter: false,
    };
    const savedSubject = await saveAdminChange("/api/admin/subjects", "POST", subject);
    if (!savedSubject) return;
    const normalizedSubject = { ...savedSubject, driveUrl: savedSubject.driveUrl || "" };
    setCatalogItems((previous) => [normalizedSubject, ...previous.filter((item) => item.id !== normalizedSubject.id)]);
    setAdminDepartment(departmentId);
    setAdminSemester(semesterNumber);
    setAdminStatus(t.saveSuccess);
    form.reset();
  }

  async function handleDriveLinkSave(event, subject) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const driveUrl = String(formData.get("driveUrl") || "").trim();
    if (driveUrl && !isGoogleDriveUrl(driveUrl)) {
      setAdminStatus(language === "bn" ? "শুধু Google Drive বা Google Docs লিংক যোগ করা যাবে।" : "Only Google Drive or Google Docs links are accepted.");
      return;
    }
    const updatedSubject = await saveAdminChange(`/api/admin/subjects/${encodeURIComponent(subject.id)}`, "PATCH", { driveUrl });
    if (!updatedSubject) return;
    setCatalogItems((previous) => previous.map((entry) => entry.id === subject.id ? { ...entry, ...updatedSubject, driveUrl: updatedSubject.driveUrl || "" } : entry));
    setAdminStatus(t.saveSuccess);
  }

  async function handleSubjectEdit(event, subject) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = String(formData.get("title") || "").trim();
    const bnTitle = String(formData.get("bnTitle") || "").trim();
    const overview = String(formData.get("overview") || "").trim();
    const bnOverview = String(formData.get("bnOverview") || "").trim();
    if (!title || !bnTitle || !overview || !bnOverview) {
      setAdminStatus(language === "bn" ? "সব বিষয়ের তথ্য পূরণ করুন।" : "Fill in all subject details.");
      return;
    }
    const updatedSubject = await saveAdminChange(`/api/admin/subjects/${encodeURIComponent(subject.id)}`, "PATCH", { title, bnTitle, overview, bnOverview });
    if (!updatedSubject) return;
    setCatalogItems((previous) => previous.map((entry) => entry.id === subject.id ? { ...entry, ...updatedSubject, driveUrl: updatedSubject.driveUrl || entry.driveUrl } : entry));
    setAdminStatus(t.saveSuccess);
  }

  async function handleDeleteSubject(subject) {
    const confirmed = window.confirm(t.deleteConfirm);
    if (!confirmed) return;
    const deletedSubject = await saveAdminChange(`/api/admin/subjects/${encodeURIComponent(subject.id)}`, "DELETE");
    if (!deletedSubject) return;
    setCatalogItems((previous) => previous.filter((entry) => entry.id !== subject.id));
    setAdminStatus(language === "bn" ? "বিষয়টি মুছে ফেলা হয়েছে।" : "Subject removed from this browser.");
  }

  function handleAuthSubmit(event) {
    event.preventDefault();
    setMessage(
      language === "bn"
        ? "এটি একটি ডেমো ফর্ম। বাস্তব অ্যাকাউন্টের জন্য সার্ভার সংযোগ প্রয়োজন।"
        : "This is a demo form. Connect a backend to enable real student accounts.",
    );
  }

  async function handlePurchase(product, productType) {
    if (checkoutPending) return;
    setCheckoutPending(true);
    setMessage("");
    let response;
    const apiProductType = productType === "resource" ? "subject" : "course";
    const isFreeResource = apiProductType === "subject" && product.price === 0;
    const endpoint = isFreeResource ? "/api/resources/free-access" : "/api/payments/bkash/checkout";
    try {
      response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId: product.id, productType: apiProductType }),
      });
    } catch (error) {
      console.error(`Could not reach the ${isFreeResource ? "free resource" : "bKash checkout"} service.`, error);
      setMessage(isFreeResource ? t.freeAccessUnavailable : t.checkoutUnavailable);
      setCheckoutPending(false);
      return;
    }
    if (!response.ok) {
      console.error(`${isFreeResource ? "Free resource" : "bKash checkout"} service returned HTTP ${response.status}.`);
      let result;
      if (response.headers.get("content-type")?.includes("application/json")) {
        try {
          result = await response.json();
        } catch (error) {
          console.error("The checkout service returned invalid JSON.", error);
        }
      }
      setMessage(result?.error || (response.status === 404 || response.status >= 500 ? t.paymentServiceUnavailable : isFreeResource ? t.freeAccessUnavailable : t.checkoutUnavailable));
      setCheckoutPending(false);
      return;
    }

    let checkout;
    try {
      checkout = await response.json();
    } catch (error) {
      console.error("The bKash checkout service returned invalid JSON.", error);
      setMessage(t.checkoutError);
      setCheckoutPending(false);
      return;
    }

    if (!checkout || typeof checkout.checkoutUrl !== "string") {
      console.error("The resource service response did not contain a delivery or checkout URL.");
      setMessage(t.checkoutError);
      setCheckoutPending(false);
      return;
    }
    let checkoutUrl;
    try {
      checkoutUrl = new URL(checkout.checkoutUrl, window.location.origin);
    } catch (error) {
      console.error("The resource service returned an invalid URL.", error);
      setMessage(t.checkoutError);
      setCheckoutPending(false);
      return;
    }
    const approvedProvider = ["tokenized.sandbox.bka.sh", "tokenized.pay.bka.sh"].includes(checkoutUrl.hostname);
    if (
      isFreeResource
        ? checkoutUrl.origin !== window.location.origin
        : checkoutUrl.protocol !== "https:" || !approvedProvider
    ) {
      console.error("The bKash checkout service returned an unsafe checkout URL.");
      setMessage(t.checkoutError);
      setCheckoutPending(false);
      return;
    }
    window.location.assign(checkoutUrl.href);
  }

  const policies = [
    ["privacy", t.privacy],
    ["terms", t.terms],
    ["refunds", t.refunds],
    ["copyright", t.copyright],
    ["disclaimer", t.disclaimer],
  ];

  if (window.location.pathname === "/payment/details") {
    return <PurchaseDetailsPage language={language} />;
  }
  if (coursePath) {
    let courseId = "";
    try {
      courseId = decodeURIComponent(coursePath[1]);
    } catch (error) {
      console.error("Could not read the course URL.", error);
    }
    const course = semesterCourses.find((item) => item.id === courseId);
    if (!course) {
      return (
        <div className="course-details-page">
          <header className="course-details-header"><Logo /></header>
          <main className="course-not-found">
            <h1>{t.courseUnavailable}</h1>
            <a className="button button-dark" href="/#courses">{t.backToCourses}<ArrowIcon /></a>
          </main>
        </div>
      );
    }
    return (
      <CourseDetailsPage
        course={course}
        departmentInfo={departments.find((entry) => entry.id === course.department)}
        language={language}
        onLanguageToggle={() => setLanguage(language === "en" ? "bn" : "en")}
        checkoutPending={checkoutPending}
        message={message}
        onPurchase={(item) => handlePurchase(item, "course")}
      />
    );
  }

  return (
    <div className="site-shell" lang={language === "bn" ? "bn" : "en"}>
      <div className="announcement">
        <span className="announcement-spark">✳</span> {t.topNote}
        <a href="#resources">{t.explore} <ArrowIcon /></a>
      </div>
      <header className="site-header" id="home">
        <div className="header-inner">
          <Logo />
          <button
            className="menu-toggle"
            aria-label="Toggle navigation"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span />
            <span />
          </button>
          <nav className={mobileMenuOpen ? "navigation is-open" : "navigation"} aria-label="Main navigation">
            <a href="#about" onClick={() => setMobileMenuOpen(false)}>{t.navAbout}</a>
            <a href="#courses" onClick={() => setMobileMenuOpen(false)}>{t.navCourses}</a>
            <a href="#resources" onClick={() => setMobileMenuOpen(false)}>{t.navResources}</a>
            <a href="#contact" onClick={() => setMobileMenuOpen(false)}>{t.navContact}</a>
          </nav>
          <div className="header-actions">
            <button
              className="language-toggle"
              onClick={() => setLanguage(language === "en" ? "bn" : "en")}
              aria-label={language === "en" ? "Switch to Bangla" : "Switch to English"}
            >
              <span className={language === "en" ? "language-active" : ""}>EN</span>
              <span className="language-divider">/</span>
              <span className={language === "bn" ? "language-active" : ""}>বাং</span>
            </button>
            <button className="button button-dark header-login" onClick={() => openAuth("login")}>
              {t.signIn} <ArrowIcon />
            </button>
          </div>
        </div>
      </header>

      <main>
        <section className="hero-section">
          <div className="hero-grid">
            <div className="hero-copy">
              <p className="eyebrow"><span className="eyebrow-dot" />{t.eyebrow}</p>
              <h1>{t.heroTitle}<span className="title-period">✳</span></h1>
              <p className="hero-description">{t.heroText}</p>
              <div className="hero-buttons">
                <a className="button button-dark" href="#resources">{t.explore}<ArrowIcon /></a>
                <a className="button button-light" href="#courses">{t.ourCourses}<span aria-hidden="true">↓</span></a>
              </div>
              <div className="hero-social-proof">
                <div className="avatar-stack" aria-hidden="true">
                  <span className="avatar avatar-one">R</span>
                  <span className="avatar avatar-two">S</span>
                  <span className="avatar avatar-three">A</span>
                  <span className="avatar avatar-four">+</span>
                </div>
                <div><strong>1,200+</strong><span>{t.students}</span></div>
                <span className="proof-divider" />
                <div><strong>{catalogItems.length}</strong><span>{t.resourcesCount}</span></div>
              </div>
            </div>
            <div className="hero-art" aria-label="Illustration of a student exploring new ideas">
              <div className="art-sun" />
              <div className="art-scribble scribble-top">✳</div>
              <div className="art-scribble scribble-side">✳</div>
              <div className="art-card card-note">
                <span className="note-icon">↗</span>
                <span>YOUR POTENTIAL<br /><b>HAS NO LIMITS</b></span>
              </div>
              <div className="art-person">
                <div className="person-hair" />
                <div className="person-head"><span className="person-eye" /></div>
                <div className="person-neck" />
                <div className="person-body">
                  <span className="shirt-detail" />
                </div>
                <div className="person-arm" />
                <div className="person-hand" />
              </div>
              <div className="art-plant">
                <i /><i /><i /><i /><span />
              </div>
              <div className="art-card card-resource">
                <span className="resource-card-icon">▤</span>
                <span><b>Study smarter</b><small>One page at a time</small></span>
                <span className="card-check">✓</span>
              </div>
              <div className="art-caption"><span>✦</span> LITTLE STEPS, BIG THINGS</div>
            </div>
          </div>
          <div className="hero-footnote">
            <span>01 — 03</span><span className="footnote-line" /><span>{t.heroNote}</span>
            <span className="hero-sticker">DTH <i>✳</i></span>
          </div>
        </section>

        <section className="trust-strip" aria-label="DTH at a glance">
          <p>{t.trusted}</p>
          <div><strong>{departments.length}</strong><span>{t.departments}</span></div>
          <div><strong>{semesterCourses.length}</strong><span>{language === "bn" ? "টি সেমিস্টার কোর্স" : "semester courses"}</span></div>
          <div className="trust-seal"><span>LEARN<br />GROW<br />REPEAT</span><i>✳</i></div>
        </section>

        <section className="section courses-section" id="courses">
          <div className="section-heading">
            <div>
              <p className="eyebrow"><span className="eyebrow-mark">✳</span>{t.courseKicker}</p>
              <h2>{t.courseTitle}</h2>
              <p className="section-description">{t.courseText}</p>
            </div>
            <span className="resource-count"><b>{semesterCourses.length}</b><small>{t.semesterCourses}</small></span>
          </div>
          <div className="catalog-notice"><span>ⓘ</span><p>{t.catalogNotice}</p></div>
          <div className="resource-filters course-filters">
            <label className="select-wrap">
              <span className="visually-hidden">{t.allDepartments}</span>
              <select value={courseDepartment} onChange={(event) => { setCourseDepartment(event.target.value); setCoursePage(1); }}>
                <option value="">{t.allDepartments}</option>
                {departments.map((item) => <option key={item.id} value={item.id}>{language === "bn" ? item.bnName : item.name}</option>)}
              </select>
              <span aria-hidden="true">⌄</span>
            </label>
            <label className="select-wrap">
              <span className="visually-hidden">{t.allSemesters}</span>
              <select value={courseSemester} onChange={(event) => { setCourseSemester(event.target.value); setCoursePage(1); }}>
                <option value="">{t.allSemesters}</option>
                {semesters.map(({ number, label, bnLabel }) => <option key={number} value={number}>{language === "bn" ? bnLabel : label} {t.semester.toLowerCase()}</option>)}
              </select>
              <span aria-hidden="true">⌄</span>
            </label>
          </div>
          <div className="course-grid">
            {visibleCourses.map((course, index) => {
              const courseDepartmentInfo = departments.find((entry) => entry.id === course.department);
              return (
              <article className="course-card" key={course.id}>
                <a className="course-card-link" href={`/courses/${encodeURIComponent(course.id)}`} aria-label={`${t.viewCourse}: ${language === "bn" ? course.bnTitle : course.title}`}>
                  <CourseArtwork course={course} departmentInfo={courseDepartmentInfo} />
                  <div className="course-card-content">
                    <div className="course-card-top">
                      <span className="course-category">{language === "bn" ? courseDepartmentInfo.bnName : courseDepartmentInfo.name}</span>
                      <span className="course-index">{String((coursePage - 1) * pageSize + index + 1).padStart(2, "0")}</span>
                    </div>
                    <h3>{language === "bn" ? course.bnTitle : course.title}</h3>
                    <p>{language === "bn" ? course.bnDescription : course.description}</p>
                    <div className="course-meta">
                      <span>◷ &nbsp;{language === "bn" ? `${semesterBnNames[course.semester - 1]} ${t.semester}` : course.duration}</span>
                      <span>৳ {course.price.toLocaleString("en-BD")}</span>
                    </div>
                    <span className="course-link">{t.viewCourse}<ArrowIcon /></span>
                  </div>
                </a>
              </article>
            );})}
          </div>
          {filteredCourses.length === 0 && <div className="empty-state"><p>{t.noResults}</p></div>}
          {filteredCourses.length > pageSize && (
            <div className="catalog-pagination">
              <button disabled={coursePage === 1} onClick={() => setCoursePage((page) => page - 1)}>{t.previousPage}</button>
              <span>{t.page} {coursePage} {t.fromTo} {coursePageCount}</span>
              <button disabled={coursePage === coursePageCount} onClick={() => setCoursePage((page) => page + 1)}>{t.nextPage}</button>
            </div>
          )}
        </section>

        <section className="resource-section" id="resources">
          <div className="resource-inner">
            <div className="section-heading">
              <div>
                <p className="eyebrow"><span className="eyebrow-mark">✳</span>{t.resourceKicker}</p>
                <h2>{t.resourceTitle}</h2>
                <p className="section-description">{t.resourceText}</p>
              </div>
              <div className="resource-heading-actions">
                <span className="resource-count"><b>{catalogItems.length}</b><small>{t.resourcesCount}</small></span>
                <button className="text-link" onClick={openAdmin}>{t.manageCatalog}<ArrowIcon /></button>
              </div>
            </div>
            <div className="catalog-notice"><span>ⓘ</span><p>{t.catalogNotice}</p></div>
            <div className="resource-filters" role="search">
              <label className="search-field">
                <span aria-hidden="true">⌕</span>
                <input
                  type="search"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(event) => { setSearch(event.target.value); setResourcePage(1); }}
                  aria-label={t.searchPlaceholder}
                />
              </label>
              <label className="select-wrap">
                <span className="visually-hidden">{t.allDepartments}</span>
                <select value={department} onChange={(event) => { setDepartment(event.target.value); setResourcePage(1); }}>
                  <option value="">{t.allDepartments}</option>
                  {departments.map((item) => <option key={item.id} value={item.id}>{language === "bn" ? item.bnName : item.name}</option>)}
                </select>
                <span aria-hidden="true">⌄</span>
              </label>
              <label className="select-wrap">
                <span className="visually-hidden">{t.allSemesters}</span>
                <select value={semester} onChange={(event) => { setSemester(event.target.value); setResourcePage(1); }}>
                  <option value="">{t.allSemesters}</option>
                  {semesters.map(({ number, label, bnLabel }) => <option key={number} value={number}>{language === "bn" ? bnLabel : label} {t.semester.toLowerCase()}</option>)}
                </select>
                <span aria-hidden="true">⌄</span>
              </label>
              <label className="select-wrap">
                <span className="visually-hidden">{t.anyPrice}</span>
                <select value={priceFilter} onChange={(event) => { setPriceFilter(event.target.value); setResourcePage(1); }}>
                  <option value="">{t.anyPrice}</option>
                  <option value="free">{t.free}</option>
                  <option value="paid">{t.paid}</option>
                </select>
                <span aria-hidden="true">⌄</span>
              </label>
            </div>
            <div className="resource-grid">
              {visibleResources.map((resource) => {
                const resourceDepartment = departments.find((item) => item.id === resource.department);
                return (
                <article className="resource-card" key={resource.id}>
                  <div className={`resource-cover cover-${resource.tint}`}>
                    <span className="cover-symbol">{resource.icon}</span>
                    <span className="cover-label">DTH · {language === "bn" ? "স্টাডি নোট" : "STUDY NOTES"}</span>
                    <span className="cover-lines"><i /><i /><i /></span>
                    <span className="cover-page">PDF</span>
                  </div>
                  <div className="resource-info">
                    <div className="resource-tags">
                      <span>{language === "bn" ? resourceDepartment.bnName : resourceDepartment.name}</span>
                      <span>{language === "bn" ? semesterBnNames[resource.semester - 1] : semesterNames[resource.semester - 1]} {t.semester.toLowerCase()}</span>
                    </div>
                    <h3>{language === "bn" ? resource.bnTitle : resource.title}</h3>
                    <p>{language === "bn" ? resource.bnOverview : resource.overview}</p>
                    <div className="resource-bottom">
                      <strong>{resource.price ? `৳ ${resource.price}` : t.freeTag}</strong>
                      <button onClick={() => openResource(resource)} aria-label={`${t.getResource}: ${resource.title}`}>
                        <ArrowIcon />
                      </button>
                    </div>
                  </div>
                </article>
              );})}
            </div>
            {filteredResources.length === 0 && (
              <div className="empty-state">
                <span>⌕</span><p>{t.noResults}</p>
                <button className="text-link" onClick={() => { setSearch(""); setDepartment(""); setSemester(""); setPriceFilter(""); setResourcePage(1); }}>
                  {t.resetFilters} <ArrowIcon />
                </button>
              </div>
            )}
            {filteredResources.length > pageSize && (
              <div className="catalog-pagination">
                <button disabled={resourcePage === 1} onClick={() => setResourcePage((page) => page - 1)}>{t.previousPage}</button>
                <span>{t.page} {resourcePage} {t.fromTo} {resourcePageCount}</span>
                <button disabled={resourcePage === resourcePageCount} onClick={() => setResourcePage((page) => page + 1)}>{t.nextPage}</button>
              </div>
            )}
          </div>
        </section>

        <section className="about-section section" id="about">
          <div className="about-art">
            <div className="about-paper">
              <span className="paper-pin" />
              <span className="paper-label">A NOTE TO YOUR FUTURE SELF</span>
              <p>Keep learning.<br />Keep becoming.</p>
              <span className="paper-signature">— Team DTH</span>
              <span className="paper-doodle">↗</span>
            </div>
            <span className="about-sticker">YOU'VE<br />GOT THIS <i>✳</i></span>
            <span className="about-orbit orbit-one" />
            <span className="about-orbit orbit-two" />
          </div>
          <div className="about-content">
            <p className="eyebrow"><span className="eyebrow-mark">✳</span>{t.aboutKicker}</p>
            <h2>{t.aboutTitle}</h2>
            <p className="about-description">{t.aboutText}</p>
            <div className="about-values">
              <article><span>01</span><div><h3>{t.mission}</h3><p>{t.missionText}</p></div></article>
              <article><span>02</span><div><h3>{t.vision}</h3><p>{t.visionText}</p></div></article>
              <article><span>03</span><div><h3>{t.activity}</h3><p>{t.activityText}</p></div></article>
            </div>
          </div>
        </section>

        <section className="steps-section">
          <div className="steps-heading">
            <p className="eyebrow"><span className="eyebrow-mark">✳</span>{t.stepsKicker}</p>
            <h2>{t.stepsTitle}</h2>
          </div>
          <div className="steps-grid">
            {[
              [t.stepOne, t.stepOneText, "01", "♧"],
              [t.stepTwo, t.stepTwoText, "02", "⌕"],
              [t.stepThree, t.stepThreeText, "03", "↗"],
            ].map(([title, text, number, icon]) => (
              <article className="step-card" key={number}>
                <div className="step-top"><span>{number}</span><i>{icon}</i></div>
                <h3>{title}</h3><p>{text}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="cta-section">
          <span className="cta-star cta-star-one">✳</span><span className="cta-star cta-star-two">✳</span>
          <div className="cta-copy">
            <p className="eyebrow">DTH — YOUR LEARNING PARTNER</p>
            <h2>{t.ctaTitle}</h2>
            <p>{t.ctaText}</p>
          </div>
          <a className="button button-cream" href="#resources">{t.ctaButton}<ArrowIcon /></a>
        </section>
      </main>

      <footer className="site-footer" id="contact">
        <div className="footer-main">
          <div className="footer-brand-col">
            <Logo footer />
            <p className="footer-tagline">Hunt Your Hidden Skill</p>
            <p className="footer-description">{t.contactText}</p>
            <div className="social-links">
              <a href={facebookUrl} target="_blank" rel="noreferrer" aria-label="Facebook">f</a>
              <a href={youtubeUrl} target="_blank" rel="noreferrer" aria-label="YouTube">▶</a>
            </div>
          </div>
          <div className="footer-column">
            <h3>{t.quickLinks}</h3>
            <a href="#about">{t.navAbout}</a><a href="#courses">{t.navCourses}</a>
            <a href="#resources">{t.navResources}</a><button onClick={() => openAuth("login")}>{t.signIn}</button>
          </div>
          <div className="footer-column footer-contact">
            <h3>{t.contactTitle}</h3>
            <a href="mailto:diplomatalenthunt@gamil.com">diplomatalenthunt@gamil.com</a>
            <a href="tel:+8801609825976">+880 1609-825976</a>
            <a href={facebookUrl} target="_blank" rel="noreferrer">Facebook <ArrowIcon /></a>
            <a href={youtubeUrl} target="_blank" rel="noreferrer">YouTube <ArrowIcon /></a>
          </div>
          <div className="footer-column footer-legal">
            <h3>{t.legal}</h3>
            {policies.map(([id, label]) => (
              <a href={`#policy-${id}`} key={id}>{label}</a>
            ))}
          </div>
        </div>
        <div className="policy-list">
          {policies.map(([id, label]) => (
            <details id={`policy-${id}`} key={id}>
              <summary>{label}</summary>
              <p>{legal[id]}</p>
            </details>
          ))}
        </div>
        <div className="footer-bottom">
          <span>{t.rights}</span>
          <span>MADE WITH <i>♥</i> FOR THE NEXT GENERATION</span>
        </div>
      </footer>

      {modal?.type === "auth" && (
        <Modal
          title={
            authMode === "register"
              ? (language === "bn" ? "শিক্ষার্থী অ্যাকাউন্ট খুলুন" : "Create your student account")
              : authMode === "forgot"
                ? (language === "bn" ? "পাসওয়ার্ড রিসেট করুন" : "Reset your password")
                : (language === "bn" ? "আবার স্বাগতম" : "Welcome back")
          }
          onClose={() => setModal(null)}
        >
          <p className="modal-intro">
            {language === "bn" ? "আপনার শেখার যাত্রা এখান থেকেই শুরু।" : "Your learning journey starts right here."}
          </p>
          <form className="auth-form" onSubmit={handleAuthSubmit}>
            {authMode === "register" && (
              <label>{language === "bn" ? "আপনার নাম" : "Full name"}<input required autoComplete="name" placeholder="e.g. Samira Rahman" /></label>
            )}
            <label>{language === "bn" ? "ইমেইল" : "Email address"}<input required type="email" autoComplete="email" placeholder="you@example.com" /></label>
            {authMode !== "forgot" && (
              <label>{language === "bn" ? "পাসওয়ার্ড" : "Password"}<input required type="password" autoComplete={authMode === "register" ? "new-password" : "current-password"} minLength="6" placeholder="At least 6 characters" /></label>
            )}
            <button className="button button-dark auth-submit" type="submit">
              {authMode === "register" ? (language === "bn" ? "অ্যাকাউন্ট খুলুন" : "Create account") : authMode === "forgot" ? (language === "bn" ? "রিসেট লিংক পাঠান" : "Send reset link") : (language === "bn" ? "লগইন" : "Log in")}
              <ArrowIcon />
            </button>
          </form>
          <div className="auth-switches">
            {authMode === "login" && <button onClick={() => { setAuthMode("forgot"); setMessage(""); }}>{language === "bn" ? "পাসওয়ার্ড ভুলে গেছেন?" : "Forgot password?"}</button>}
            <button onClick={() => { setAuthMode(authMode === "register" ? "login" : "register"); setMessage(""); }}>
              {authMode === "register" ? (language === "bn" ? "আগে থেকেই অ্যাকাউন্ট আছে? লগইন" : "Already have an account? Log in") : (language === "bn" ? "নতুন শিক্ষার্থী? অ্যাকাউন্ট খুলুন" : "New here? Create an account")}
            </button>
          </div>
          {message && <p className="form-message" role="status">{message}</p>}
        </Modal>
      )}

      {modal?.type === "admin" && (
        <Modal title={t.adminTitle} onClose={() => setModal(null)}>
          <p className="modal-intro">{t.adminNote}</p>
          <label className="admin-key-field">
            {t.adminKey}
            <input
              type="password"
              autoComplete="off"
              value={adminKey}
              onChange={(event) => setAdminKey(event.target.value)}
              placeholder="ADMIN_API_KEY"
            />
          </label>
          {adminStatus && <p className="form-message" role="status">{adminStatus}</p>}
          <form className="auth-form admin-form" onSubmit={handleAddSubject}>
            <label>{t.department}
              <select name="department" value={adminDepartment} onChange={(event) => setAdminDepartment(event.target.value)} required>
                {departments.map((item) => <option key={item.id} value={item.id}>{language === "bn" ? item.bnName : item.name}</option>)}
              </select>
            </label>
            <label>{t.semester}
              <select name="semester" value={adminSemester} onChange={(event) => setAdminSemester(Number(event.target.value))} required>
                {semesters.map(({ number, label, bnLabel }) => <option key={number} value={number}>{language === "bn" ? bnLabel : label}</option>)}
              </select>
            </label>
            <label>{t.subjectName}<input name="title" required maxLength="120" /></label>
            <label>{t.subjectNameBn}<input name="bnTitle" required maxLength="120" /></label>
            <label>{t.subjectDescription}<textarea name="overview" required maxLength="600" rows="3" /></label>
            <label>{language === "bn" ? "বিষয়ের পরিচিতি (বাংলা)" : "Subject overview (Bangla)"}<textarea name="bnOverview" required maxLength="600" rows="3" /></label>
            <label>{language === "bn" ? "PDF-এর মূল্য (৳)" : "PDF price (৳)"}<input name="price" type="number" min="0" max="100000" defaultValue="80" required /></label>
            <label>{t.driveUrl}<input name="driveUrl" type="url" placeholder="https://drive.google.com/..." /></label>
            <p className="admin-hint">{t.driveLinkHint}</p>
            <button className="button button-dark auth-submit" type="submit">{t.addSubject}<ArrowIcon /></button>
          </form>
          <div className="admin-subject-list">
            <h3>{language === "bn" ? "নির্বাচিত পর্বের বিষয়" : "Subjects in the selected semester"}</h3>
            {adminSubjects.length === 0 && <p className="modal-intro">{t.noAdminSubjects}</p>}
            {adminSubjects.map((subject) => (
              <article className="admin-subject" key={subject.id}>
                <form className="admin-edit-form" onSubmit={(event) => handleSubjectEdit(event, subject)}>
                  <label>{t.subjectName}<input name="title" required maxLength="120" defaultValue={subject.title} /></label>
                  <label>{t.subjectNameBn}<input name="bnTitle" required maxLength="120" defaultValue={subject.bnTitle} /></label>
                  <label>{t.subjectDescription}<textarea name="overview" required maxLength="600" rows="2" defaultValue={subject.overview} /></label>
                  <label>{language === "bn" ? "বিষয়ের পরিচিতি (বাংলা)" : "Subject overview (Bangla)"}<textarea name="bnOverview" required maxLength="600" rows="2" defaultValue={subject.bnOverview} /></label>
                  <button type="submit">{t.updateSubject}</button>
                </form>
                <form className="admin-drive-form" onSubmit={(event) => handleDriveLinkSave(event, subject)}>
                  <input name="driveUrl" type="url" aria-label={`${t.driveUrl}: ${subject.title}`} placeholder="https://drive.google.com/..." defaultValue={subject.driveUrl} />
                  <button type="submit">{language === "bn" ? "লিংক সেভ" : "Save link"}</button>
                </form>
                <button className="admin-delete" onClick={() => handleDeleteSubject(subject)}>{t.deleteSubject}</button>
              </article>
            ))}
          </div>
        </Modal>
      )}

      {(modal?.type === "resource" || modal?.type === "semester-course") && (
        <Modal
          title={language === "bn" ? modal.item.bnTitle : modal.item.title}
          onClose={() => setModal(null)}
        >
          <p className="modal-intro">
            {modal.type === "resource"
              ? `${departments.find((item) => item.id === modal.item.department)?.[language === "bn" ? "bnName" : "name"]} · ${language === "bn" ? semesterBnNames[modal.item.semester - 1] : semesterNames[modal.item.semester - 1]} ${t.semester} · ${modal.item.price ? `৳ ${modal.item.price}` : t.freeTag}`
              : `${language === "bn" ? semesterBnNames[modal.item.semester - 1] : semesterNames[modal.item.semester - 1]} ${t.semester} · ৳ ${modal.item.price}`}
          </p>
          <div className="subject-overview">
            <h3>{modal.type === "resource" ? t.subjectOverview : t.includedSubjects}</h3>
            <p>{language === "bn"
              ? modal.type === "resource" ? modal.item.bnOverview : modal.item.bnDescription
              : modal.type === "resource" ? modal.item.overview : modal.item.description}
            </p>
            {modal.type === "semester-course" && (
              <ul>
                {modal.item.subjects.map((subject) => (
                  <li key={subject.id}>{language === "bn" ? subject.bnTitle : subject.title}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="purchase-note">
            <span>✳</span>
            <p>{language === "bn"
              ? "পেমেন্ট সম্পন্ন ও যাচাই হওয়ার পরই সার্ভার থেকে নিরাপদ PDF/Google Drive লিংক দেওয়া হবে। এই ডেমোতে পেমেন্ট সার্ভার সংযুক্ত নেই।"
              : "The server should release the PDF/Google Drive link only after payment is verified. The payment service is not connected in this demo."}
            </p>
          </div>
          <button className="button button-dark auth-submit" disabled={checkoutPending} onClick={() => handlePurchase(modal.item, modal.type === "resource" ? "resource" : "course")}>
            {checkoutPending
              ? (language === "bn" ? "সংযোগ হচ্ছে..." : "Connecting...")
              : modal.type === "resource" && modal.item.price === 0 ? t.freeResourceButton : t.purchaseButton}
            <ArrowIcon />
          </button>
          {message && <p className="form-message" role="status">{message}</p>}
        </Modal>
      )}
    </div>
  );
}

export default App;
