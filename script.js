if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker зареєстрований з обсягом:', registration.scope);
      })
      .catch(err => {
        console.log('Реєстрація Service Worker провалена:', err);
      });
  });
}


// --- Бургер-меню ---
const burgerIcon = document.getElementById('burgerIcon');
const burgerDropdown = document.getElementById('burgerDropdown');

burgerIcon.addEventListener('click', () => {
  burgerDropdown.style.display = burgerDropdown.style.display === 'flex' ? 'none' : 'flex';
});

// --- Дзвіночок та сповіщення ---
const bell = document.getElementById('bell');
const notificationDot = document.getElementById('notificationDot');
let dotVisible = false;

bell.addEventListener('dblclick', () => {
  dotVisible = !dotVisible;
  notificationDot.style.display = dotVisible ? 'block' : 'none';

  bell.classList.add("animate");
  bell.addEventListener("animationend", function handler() {
    bell.classList.remove("animate");
    bell.removeEventListener("animationend", handler);
  });
});

// --- Профіль: випадаюче меню ---
const userInfo = document.getElementById("userInfo");
const userDropdown = document.getElementById("userDropdown");

userInfo.addEventListener("mouseenter", () => {
  userDropdown.style.display = "flex";
});
userInfo.addEventListener("mouseleave", () => {
  userDropdown.style.display = "none";
});

// --- Модальні вікна ---
const addModal = document.getElementById("addStudentModal");
const editModal = document.getElementById("editStudentModal");
const deleteModal = document.getElementById("deleteStudentModal");

const openAddBtn = document.getElementById("openAddModal");
const closeAddBtn = document.getElementById("closeAddModal");
const closeEditBtn = document.getElementById("closeEditModal");
const closeDeleteBtn = document.getElementById("closeDeleteModal");
const cancelDeleteBtn = document.getElementById("cancelDelete");
const confirmDeleteBtn = document.getElementById("confirmDelete");

let studentToEdit = null;
let studentToDelete = null;

// --- Вибір усіх чекбоксів ---
const selectAll = document.getElementById('selectAllCheckbox');
selectAll.addEventListener('change', function () {
  const isChecked = this.checked;
  const checkboxes = document.querySelectorAll('.rowCheckbox');
  checkboxes.forEach(checkbox => checkbox.checked = isChecked);
});

// --- Допоміжна функція скидання форми і очищення помилок ---
function resetForm(form) {
  form.reset();
  const errorMessages = form.querySelectorAll('.error-message');
  errorMessages.forEach(em => em.textContent = '');
  const errorInputs = form.querySelectorAll('.input-error');
  errorInputs.forEach(input => input.classList.remove('input-error'));
}

// --- Закриття модалки та скидання форми ---
function closeModal(modal, form) {
  modal.style.display = 'none';
  if (form) resetForm(form);
}

// --- Обробники відкриття/закриття модалок ---
openAddBtn.onclick = () => addModal.style.display = "block";

closeAddBtn.onclick = () => closeModal(addModal, document.getElementById("addStudentForm"));
closeEditBtn.onclick = () => closeModal(editModal, document.getElementById("editStudentForm"));
closeDeleteBtn.onclick = () => {
  deleteModal.style.display = "none";
  studentToDelete = null;
};
cancelDeleteBtn.onclick = closeDeleteBtn.onclick;

// --- Функція форматування дати ---
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

// --- Валідація полів форми ---
function validateField(input, type) {
  const errorDiv = document.getElementById(input.id + "Error");
  const value = input.value.trim();
  let error = "";

  if (!value) {
    error = input.tagName === 'SELECT' ? `Please select a ${input.name}` : "This field is required";
  } else if (type === "name" && !/^[A-Za-z]{2,40}$/.test(value)) {
    error = `The ${input.name} must contain only Latin letters (2–40 characters)`;
  } else if (type === "date") {
    const year = new Date(value).getFullYear();
    if (year < 1925 || year > 2009) {
      error = `Select a birth date between 1925 and 2009`;
    }
  }

  if (error) {
    input.classList.add("input-error");
    errorDiv.textContent = error;
    return false;
  } else {
    input.classList.remove("input-error");
    errorDiv.textContent = "";
    return true;
  }
}

function validateForm(formId) {
  const form = document.getElementById(formId);
  const fields = formId === "addStudentForm" ? [
    { id: "group", type: "select" },
    { id: "firstName", type: "name" },
    { id: "lastName", type: "name" },
    { id: "gender", type: "select" },
    { id: "birthday", type: "date" }
  ] : [
    { id: "editGroup", type: "select" },
    { id: "editFirstName", type: "name" },
    { id: "editLastName", type: "name" },
    { id: "editGender", type: "select" },
    { id: "editBirthday", type: "date" }
  ];

  let isValid = true;
  fields.forEach(({ id, type }) => {
    const input = form.querySelector(`#${id}`);
    if (!validateField(input, type)) {
      isValid = false;
    }
  });

  return isValid;
}

// --- Додавання нового студента ---
const addForm = document.getElementById("addStudentForm");
addForm.addEventListener("submit", function (e) {
  e.preventDefault();
  if (!validateForm("addStudentForm")) return;

  const group = document.getElementById("group").value;
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const gender = document.getElementById("gender").value;
  const birthday = document.getElementById("birthday").value;

  const tbody = document.getElementById("studentsList");
  const newRow = document.createElement("tr");
  newRow.innerHTML = `
    <td><input type="checkbox" class="rowCheckbox"></td>
    <td>${group}</td>
    <td>${firstName} ${lastName}</td>
    <td>${gender}</td>
    <td>${formatDate(birthday)}</td>
    <td><span class="status active"></span></td>
    <td>
      <img src="icons8-edit.gif" class="editBtn icon-button" alt="Edit">
      <img src="icons8-delete.gif" class="deleteBtn icon-button" alt="Delete">
    </td>
  `;
  tbody.appendChild(newRow);

  closeModal(addModal, addForm);
});

// --- Делегована обробка кнопок "редагувати" та "видалити" ---
const studentsList = document.getElementById("studentsList");

studentsList.addEventListener("click", function (e) {
  const row = e.target.closest("tr");
  if (!row) return;
  const cells = row.querySelectorAll("td");

  if (e.target.classList.contains("editBtn")) {
    const group = cells[1].textContent;
    const [firstName, lastName] = cells[2].textContent.trim().split(" ");
    const gender = cells[3].textContent;
    const birthdayText = cells[4].textContent.trim();
    const [day, month, year] = birthdayText.split(".");
    const birthday = `${year}-${month}-${day}`;

    document.getElementById("editGroup").value = group;
    document.getElementById("editFirstName").value = firstName || "";
    document.getElementById("editLastName").value = lastName || "";
    document.getElementById("editGender").value = gender;
    document.getElementById("editBirthday").value = birthday;

    studentToEdit = row;
    editModal.style.display = "block";
  }

  if (e.target.classList.contains("deleteBtn")) {
    studentToDelete = row;
    const fullName = cells[2].textContent;
    document.getElementById("studentNameToDelete").textContent = fullName;
    deleteModal.style.display = "block";
  }
});

// --- Підтвердження видалення ---
confirmDeleteBtn.onclick = () => {
  if (studentToDelete) {
    studentToDelete.remove();
    studentToDelete = null;
  }
  deleteModal.style.display = "none";
};

// --- Збереження змін при редагуванні ---
const editForm = document.getElementById("editStudentForm");
editForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (!validateForm("editStudentForm")) return;

  const group = document.getElementById("editGroup").value;
  const firstName = document.getElementById("editFirstName").value;
  const lastName = document.getElementById("editLastName").value;
  const gender = document.getElementById("editGender").value;
  const birthday = document.getElementById("editBirthday").value;

  if (studentToEdit) {
    const cells = studentToEdit.querySelectorAll("td");
    cells[1].textContent = group;
    cells[2].textContent = `${firstName} ${lastName}`;
    cells[3].textContent = gender;
    cells[4].textContent = formatDate(birthday);
  }

  closeModal(editModal, editForm);
});
