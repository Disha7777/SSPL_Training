const courseList = document.getElementById('courseList');
const searchInput = document.querySelector('.header__search');

const modal = document.getElementById('courseModal');
const modalTitle = document.getElementById('modalTitle');
const modalCategory = document.getElementById('modalCategory');
const modalDescription = document.getElementById('modalDescription');
const modalDetails = document.getElementById('modalDetails');
const closeBtn = document.querySelector('.modal__close');
const enrollBtn = document.getElementById('enrollBtn');
const enrollForm = document.querySelector('.enroll-form');

let courses = [];

/* MOCK API */
function fetchCoursesFromAPI() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve([
        {id:1,title:"HTML & CSS Fundamentals",category:"Web Development",description:"Build modern websites from scratch.",duration:"4 Weeks",level:"Beginner",instructor:"John Doe"},
        {id:2,title:"JavaScript Mastery",category:"Programming",description:"Deep dive into JavaScript & ES6+.",duration:"6 Weeks",level:"Intermediate",instructor:"Sarah Smith"},
        {id:3,title:"React for Beginners",category:"Frontend",description:"Create dynamic UIs using React.",duration:"5 Weeks",level:"Beginner",instructor:"Alex Johnson"},
        {id:4,title:"Advanced React Patterns",category:"Frontend",description:"Professional React techniques.",duration:"4 Weeks",level:"Advanced",instructor:"Alex Johnson"},
        {id:5,title:"Node.js & Express",category:"Backend",description:"Build REST APIs with Node.",duration:"6 Weeks",level:"Advanced",instructor:"Emily Brown"},
        {id:6,title:"MongoDB Essentials",category:"Database",description:"NoSQL database fundamentals.",duration:"3 Weeks",level:"Beginner",instructor:"Chris Lee"},
        {id:7,title:"Python Programming",category:"Programming",description:"Python from zero to hero.",duration:"6 Weeks",level:"Beginner",instructor:"David Kim"},
        {id:8,title:"Data Science with Python",category:"Data Science",description:"Analyze data professionally.",duration:"8 Weeks",level:"Advanced",instructor:"Sophia Clark"},
        {id:9,title:"UI/UX Design Basics",category:"Design",description:"Design better user experiences.",duration:"4 Weeks",level:"Beginner",instructor:"Emma White"},
        {id:10,title:"Figma for Designers",category:"Design",description:"Design interfaces using Figma.",duration:"3 Weeks",level:"Beginner",instructor:"Emma White"},
        {id:11,title:"Cybersecurity Fundamentals",category:"Security",description:"Protect systems & networks.",duration:"5 Weeks",level:"Beginner",instructor:"Mark Evans"},
        {id:12,title:"Ethical Hacking",category:"Security",description:"Learn penetration testing.",duration:"6 Weeks",level:"Advanced",instructor:"Mark Evans"},
        {id:13,title:"Cloud Computing",category:"Cloud",description:"AWS, Azure & cloud concepts.",duration:"5 Weeks",level:"Intermediate",instructor:"Laura Green"},
        {id:14,title:"DevOps Essentials",category:"DevOps",description:"CI/CD and automation.",duration:"4 Weeks",level:"Intermediate",instructor:"Ryan Scott"},
        {id:15,title:"Docker & Kubernetes",category:"DevOps",description:"Container orchestration.",duration:"5 Weeks",level:"Advanced",instructor:"Ryan Scott"},
        {id:16,title:"Android App Development",category:"Mobile",description:"Build Android apps.",duration:"6 Weeks",level:"Beginner",instructor:"Nina Patel"},
        {id:17,title:"iOS Development",category:"Mobile",description:"Create iOS applications.",duration:"6 Weeks",level:"Beginner",instructor:"Nina Patel"},
        {id:18,title:"Machine Learning Basics",category:"AI",description:"ML concepts and algorithms.",duration:"7 Weeks",level:"Intermediate",instructor:"Alan Turing"},
        {id:19,title:"Artificial Intelligence",category:"AI",description:"AI principles and use cases.",duration:"8 Weeks",level:"Advanced",instructor:"Alan Turing"},
        {id:20,title:"Blockchain Fundamentals",category:"Blockchain",description:"Understand blockchain tech.",duration:"4 Weeks",level:"Beginner",instructor:"Satoshi Nakamoto"}
      ]);
    }, 500);
  });
}

/* LOAD */
async function loadCourses() {
  courses = await fetchCoursesFromAPI();
  renderCourses(courses);
}

/* RENDER */
function renderCourses(list) {
  courseList.innerHTML = '';
  list.forEach(course => {
    const card = document.createElement('article');
    card.className = 'course';

    card.innerHTML = `
      <span class="course__category">${course.category}</span>
      <h3 class="course__title">${course.title}</h3>
      <p class="course__description">${course.description}</p>
      <button class="course__btn">View Details</button>
    `;

    card.querySelector('button').addEventListener('click', () => showDetails(course));
    courseList.appendChild(card);
  });
}

/* DETAILS */
function showDetails(course) {
  modalTitle.innerText = course.title;
  modalCategory.innerText = course.category;
  modalDescription.innerText = course.description;

  modalDetails.innerHTML = `
    <li><strong>Duration:</strong> ${course.duration}</li>
    <li><strong>Level:</strong> ${course.level}</li>
    <li><strong>Instructor:</strong> ${course.instructor}</li>
  `;

  enrollForm.classList.add('hidden');
  enrollBtn.classList.remove('hidden');
  modal.classList.remove('hidden');
}

/* SEARCH */
function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

searchInput.addEventListener('input', debounce(() => {
  const value = searchInput.value.toLowerCase();
  renderCourses(courses.filter(c =>
    c.title.toLowerCase().includes(value) ||
    c.category.toLowerCase().includes(value)
  ));
}));

/* ENROLL */
enrollBtn.addEventListener('click', () => {
  enrollForm.classList.remove('hidden');
  enrollBtn.classList.add('hidden');
});

closeBtn.addEventListener('click', () => modal.classList.add('hidden'));

$('.enroll-form').on('submit', function(e) {
  e.preventDefault();
  alert('Enrollment successful!');
  modal.classList.add('hidden');
});

/* INIT */
loadCourses();
