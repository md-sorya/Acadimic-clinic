import { initializeApp } from "https://www.gstatic.com/firebasejs/9.30.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, deleteDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/9.30.0/firebase-firestore.js";

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyDtSPuqIjZu7TDJI-GklqLmzfUfYIGNz0c",
  authDomain: "acadimic-b1d5b.firebaseapp.com",
  projectId: "acadimic-b1d5b",
  storageBucket: "acadimic-b1d5b.appspot.com",
  messagingSenderId: "101330482436",
  appId: "1:101330482436:web:30f56c07fc544936a14c51"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let currentStudent=null;

// إضافة طالب
async function addStudent(){
  const name=document.getElementById('name').value;
  const className=document.getElementById('className').value;
  const housing=document.getElementById('housing').value;
  const phone=document.getElementById('phone').value;

  await addDoc(collection(db,'students'),{
    name,className,housing,phone,
    problems:[],
    finalResults:[]
  });
  renderStudents();
}

// عرض الطلاب
async function renderStudents(){
  const querySnapshot = await getDocs(collection(db,'students'));
  let h='<tr><th>رقم الملف</th><th>الاسم</th><th>فتح</th><th>حذف</th></tr>';
  querySnapshot.forEach(docSnap=>{
    const st={id:docSnap.id,...docSnap.data()};
    h+=`<tr>
      <td>${st.id}</td>
      <td>${st.name}</td>
      <td><button onclick="openStudent('${st.id}')">فتح</button></td>
      <td><button onclick="deleteStudent('${st.id}')">حذف</button></td>
    </tr>`;
  });
  document.getElementById('studentsTable').innerHTML=h;
}

// فتح ملف الطالب
async function openStudent(id){
  currentStudent={id};
  const docSnap = await getDocs(collection(db,'students'));
  const stDoc = await doc(db,'students',id);
  const stData = (await getDocs(collection(db,'students'))).docs.find(d=>d.id===id).data();
  currentStudent={id,...stData};

  document.getElementById('studentDetails').style.display='block';
  document.getElementById('studentName').innerText=currentStudent.name;
  document.getElementById('studentClass').innerText=currentStudent.className;
  document.getElementById('studentHousing').innerText=currentStudent.housing;
  document.getElementById('studentPhone').innerText=currentStudent.phone;

  renderProblems();
  renderFinalResults();
}

// إغلاق ملف الطالب
function closeStudent(){
  currentStudent=null;
  document.getElementById('studentDetails').style.display='none';
}

// إضافة مشكلة
async function addProblem(){
  if(!currentStudent) return;
  const subject=document.getElementById('problemSubject').value;
  const part=document.getElementById('problemPart').value;
  const teacher=document.getElementById('problemTeacher').value;
  const status=document.getElementById('problemStatus').value;

  currentStudent.problems.push({subject,part,teacher,status});
  await updateDoc(doc(db,'students',currentStudent.id),{problems:currentStudent.problems});
  renderProblems();
}

// عرض المشاكل
function renderProblems(){
  let h='<tr><th>المادة</th><th>الجزئية</th><th>الأستاذ</th><th>الحالة</th></tr>';
  currentStudent.problems.forEach(p=>{
    h+=`<tr>
      <td>${p.subject}</td>
      <td>${p.part}</td>
      <td>${p.teacher}</td>
      <td>${p.status}</td>
    </tr>`;
  });
  document.getElementById('problemsTable').innerHTML=h;
}

// إضافة النتيجة النهائية
async function addFinalResult(){
  if(!currentStudent) return;
  const subject=document.getElementById('finalSubject').value;
  const grade=document.getElementById('finalGrade').value;

  currentStudent.finalResults.push({subject,grade});
  await updateDoc(doc(db,'students',currentStudent.id),{finalResults:currentStudent.finalResults});
  renderFinalResults();
}

// عرض النتائج النهائية
function renderFinalResults(){
  let h='<tr><th>المشكلة</th><th>الدرجة</th></tr>';
  currentStudent.finalResults.forEach(r=>{
    h+=`<tr><td>${r.subject}</td><td>${r.grade}</td></tr>`;
  });
  document.getElementById('finalResultsTable').innerHTML=h;
}

// حذف طالب
async function deleteStudent(id){
  if(confirm('هل تريد حذف هذا الطالب؟')){
    await deleteDoc(doc(db,'students',id));
    renderStudents();
  }
}

// البحث
async function searchStudents(){
  const q=document.getElementById('searchInput').value.toLowerCase();
  const querySnapshot = await getDocs(collection(db,'students'));
  let h='<tr><th>الاسم</th><th>الفصل</th><th>السكن</th><th>رقم الهاتف</th><th>المادة</th><th>الجزئية</th><th>الأستاذ</th></tr>';
  querySnapshot.forEach(docSnap=>{
    const st={id:docSnap.id,...docSnap.data()};
    st.problems.forEach(p=>{
      if(st.name.toLowerCase().includes(q) || p.subject.toLowerCase().includes(q) || p.part.toLowerCase().includes(q) || p.teacher.toLowerCase().includes(q)){
        h+=`<tr>
          <td>${st.name}</td>
          <td>${st.className}</td>
          <td>${st.housing}</td>
          <td>${st.phone}</td>
          <td>${p.subject}</td>
          <td>${p.part}</td>
          <td>${p.teacher}</td>
        </tr>`;
      }
    });
  });
  document.getElementById('searchResults').innerHTML=h;
}

// إنشاء حصة
async function createSession(){
  const teacher=document.getElementById('sessionTeacher').value.toLowerCase().trim();
  const subject=document.getElementById('sessionSubject').value.toLowerCase().trim();
  const part=document.getElementById('sessionPart').value.toLowerCase().trim();

  const querySnapshot = await getDocs(collection(db,'students'));
  let h='<tr><th>الاسم</th><th>السكن</th><th>رقم الهاتف</th><th>الفصل</th><th>المادة</th><th>الجزئية</th><th>الأستاذ</th></tr>';

  querySnapshot.forEach(docSnap=>{
    const st={id:docSnap.id,...docSnap.data()};
    st.problems.forEach(p=>{
      const matchTeacher = teacher ? p.teacher.toLowerCase().includes(teacher) : true;
      const matchSubject = subject ? p.subject.toLowerCase().includes(subject) : true;
      const matchPart = part ? p.part.toLowerCase().includes(part) : true;
      if(matchTeacher && matchSubject && matchPart){
        h+=`<tr>
          <td>${st.name}</td>
          <td>${st.housing}</td>
          <td>${st.phone}</td>
          <td>${st.className}</td>
          <td>${p.subject}</td>
          <td>${p.part}</td>
          <td>${p.teacher}</td>
        </tr>`;
      }
    });
  });
  if(h==='<tr><th>الاسم</th><th>السكن</th><th>رقم الهاتف</th><th>الفصل</th><th>المادة</th><th>الجزئية</th><th>الأستاذ</th></tr>'){
    h='<tr><td colspan="7">لا توجد نتائج مطابقة</td></tr>';
  }
  document.getElementById('sessionResults').innerHTML=h;
}

// تفعيل التحديث الفوري بين الأجهزة
onSnapshot(collection(db,'students'),snapshot=>{
  renderStudents();
  if(currentStudent) openStudent(currentStudent.id);
});

// عرض الطلاب عند تحميل الصفحة
renderStudents();
