// =============================================
// SUPABASE CONNECTION
// =============================================

const SUPABASE_URL = "https://qrfhspyrrphghddqtuwg.supabase.co";
const SUPABASE_KEY = "sb_publishable_iyYP6IsoBuv-jc7x1l7HBQ_Pllm9LTg";

const supabaseClient = supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// =============================================
// PAGE ELEMENTS
// =============================================

const authSection = document.getElementById("auth-section");
const appSection = document.getElementById("app-section");

const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const loginBtn = document.getElementById("login-btn");
const registerBtn = document.getElementById("register-btn");
const logoutBtn = document.getElementById("logout-btn");

const authMessage = document.getElementById("auth-message");
const userEmail = document.getElementById("user-email");

const assignmentForm = document.getElementById("assignment-form");

const courseNameInput = document.getElementById("course-name");
const assignmentNameInput = document.getElementById("assignment-name");
const dueDateInput = document.getElementById("due-date");
const statusInput = document.getElementById("status");
const notesInput = document.getElementById("notes");

const assignmentList = document.getElementById("assignment-list");
const assignmentMessage = document.getElementById("assignment-message");

const saveBtn = document.getElementById("save-btn");
const cancelEditBtn = document.getElementById("cancel-edit-btn");
const formTitle = document.getElementById("form-title");
const filterStatus = document.getElementById("filter-status");

let currentUser = null;
let assignments = [];
let editingAssignmentId = null;


// =============================================
// MESSAGE HELPERS
// =============================================

function showAuthMessage(message, type = "error") {
    authMessage.textContent = message;
    authMessage.className = type;
}

function showAssignmentMessage(message, type = "success") {
    assignmentMessage.textContent = message;
    assignmentMessage.className = type;

    setTimeout(() => {
        assignmentMessage.textContent = "";
        assignmentMessage.className = "";
    }, 3000);
}


// =============================================
// REGISTER
// =============================================

registerBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthMessage("Please enter an email and password.");
        return;
    }

    if (password.length < 6) {
        showAuthMessage("Password must be at least 6 characters.");
        return;
    }

    const { data, error } = await supabaseClient.auth.signUp({
        email: email,
        password: password
    });

    if (error) {
        showAuthMessage(error.message);
        return;
    }

    showAuthMessage(
        "Account created successfully! You can now log in.",
        "success"
    );

    passwordInput.value = "";
});


// =============================================
// LOGIN
// =============================================

loginBtn.addEventListener("click", async () => {

    const email = emailInput.value.trim();
    const password = passwordInput.value;

    if (!email || !password) {
        showAuthMessage("Please enter your email and password.");
        return;
    }

    const { data, error } =
        await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });

    if (error) {
        showAuthMessage("Login failed: " + error.message);
        return;
    }

    currentUser = data.user;

    showApp();

    emailInput.value = "";
    passwordInput.value = "";

    await loadAssignments();
});


// =============================================
// LOGOUT
// =============================================

logoutBtn.addEventListener("click", async () => {

    await supabaseClient.auth.signOut();

    currentUser = null;
    assignments = [];

    authSection.classList.remove("hidden");
    appSection.classList.add("hidden");

    assignmentList.innerHTML = "";

    showAuthMessage(
        "You have been logged out.",
        "success"
    );
});


// =============================================
// SHOW APPLICATION
// =============================================

function showApp() {

    authSection.classList.add("hidden");
    appSection.classList.remove("hidden");

    userEmail.textContent = currentUser.email;

    authMessage.textContent = "";
}


// =============================================
// CREATE OR UPDATE ASSIGNMENT
// =============================================

assignmentForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!currentUser) {
        return;
    }

    const assignmentData = {
        course_name: courseNameInput.value.trim(),
        assignment_name: assignmentNameInput.value.trim(),
        due_date: dueDateInput.value,
        status: statusInput.value,
        notes: notesInput.value.trim()
    };

    // UPDATE existing assignment
    if (editingAssignmentId !== null) {

        const { error } = await supabaseClient
            .from("assignments")
            .update(assignmentData)
            .eq("id", editingAssignmentId);

        if (error) {
            showAssignmentMessage(error.message, "error");
            return;
        }

        showAssignmentMessage(
            "Assignment updated successfully!"
        );

        resetForm();
        await loadAssignments();

        return;
    }


    // CREATE new assignment
    const { error } = await supabaseClient
        .from("assignments")
        .insert([assignmentData]);

    if (error) {
        showAssignmentMessage(error.message, "error");
        return;
    }

    showAssignmentMessage(
        "Assignment added successfully!"
    );

    resetForm();

    await loadAssignments();
});


// =============================================
// READ ASSIGNMENTS
// =============================================

async function loadAssignments() {

    if (!currentUser) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("assignments")
        .select("*")
        .order("due_date", { ascending: true });

    if (error) {
        showAssignmentMessage(error.message, "error");
        return;
    }

    assignments = data || [];

    displayAssignments();
}


// =============================================
// DISPLAY ASSIGNMENTS
// =============================================

function displayAssignments() {

    assignmentList.innerHTML = "";

    const selectedStatus = filterStatus.value;

    let filteredAssignments = assignments;

    if (selectedStatus !== "All") {
        filteredAssignments = assignments.filter(
            assignment => assignment.status === selectedStatus
        );
    }

    if (filteredAssignments.length === 0) {

        assignmentList.innerHTML =
            '<p id="empty-message">No assignments found.</p>';

        return;
    }

    filteredAssignments.forEach((assignment) => {

        const assignmentItem =
            document.createElement("div");

        assignmentItem.className = "assignment-item";


        const title = document.createElement("h3");
        title.textContent = assignment.assignment_name;


        const course = document.createElement("p");
        course.innerHTML =
            "<strong>Course:</strong> " +
            escapeHTML(assignment.course_name);


        const dueDate = document.createElement("p");

        const formattedDate =
            formatDate(assignment.due_date);

        dueDate.innerHTML =
            "<strong>Due:</strong> " +
            formattedDate;


        const status = document.createElement("p");
        status.innerHTML =
            "<strong>Status:</strong> " +
            escapeHTML(assignment.status);


        const notes = document.createElement("p");

        notes.innerHTML =
            "<strong>Notes:</strong> " +
            escapeHTML(
                assignment.notes || "No notes"
            );


        const actions =
            document.createElement("div");

        actions.className = "assignment-actions";


        const editButton =
            document.createElement("button");

        editButton.textContent = "Edit";
        editButton.className = "edit-btn";

        editButton.addEventListener(
            "click",
            () => startEdit(assignment.id)
        );


        const deleteButton =
            document.createElement("button");

        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-btn";

        deleteButton.addEventListener(
            "click",
            () => deleteAssignment(assignment.id)
        );


        actions.appendChild(editButton);
        actions.appendChild(deleteButton);

        assignmentItem.appendChild(title);
        assignmentItem.appendChild(course);
        assignmentItem.appendChild(dueDate);
        assignmentItem.appendChild(status);
        assignmentItem.appendChild(notes);
        assignmentItem.appendChild(actions);

        assignmentList.appendChild(assignmentItem);
    });
}


// =============================================
// EDIT ASSIGNMENT
// =============================================

function startEdit(id) {

    const assignment = assignments.find(
        item => item.id === id
    );

    if (!assignment) {
        return;
    }

    editingAssignmentId = id;

    courseNameInput.value =
        assignment.course_name;

    assignmentNameInput.value =
        assignment.assignment_name;

    dueDateInput.value =
        assignment.due_date;

    statusInput.value =
        assignment.status;

    notesInput.value =
        assignment.notes || "";

    formTitle.textContent =
        "Edit Assignment";

    saveBtn.textContent =
        "Save Changes";

    cancelEditBtn.classList.remove("hidden");

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// =============================================
// CANCEL EDIT
// =============================================

cancelEditBtn.addEventListener("click", () => {
    resetForm();
});


// =============================================
// DELETE ASSIGNMENT
// =============================================

async function deleteAssignment(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this assignment?"
    );

    if (!confirmed) {
        return;
    }

    const { error } = await supabaseClient
        .from("assignments")
        .delete()
        .eq("id", id);

    if (error) {
        showAssignmentMessage(error.message, "error");
        return;
    }

    showAssignmentMessage(
        "Assignment deleted successfully!"
    );

    await loadAssignments();
}


// =============================================
// RESET FORM
// =============================================

function resetForm() {

    assignmentForm.reset();

    editingAssignmentId = null;

    formTitle.textContent =
        "Add Assignment";

    saveBtn.textContent =
        "Add Assignment";

    cancelEditBtn.classList.add("hidden");
}


// =============================================
// FILTER ASSIGNMENTS
// =============================================

filterStatus.addEventListener(
    "change",
    displayAssignments
);


// =============================================
// FORMAT DATE
// =============================================

function formatDate(dateString) {

    const date = new Date(
        dateString + "T00:00:00"
    );

    return date.toLocaleDateString(
        undefined,
        {
            year: "numeric",
            month: "long",
            day: "numeric"
        }
    );
}


// =============================================
// BASIC HTML SAFETY
// =============================================

function escapeHTML(value) {

    const div = document.createElement("div");

    div.textContent = value ?? "";

    return div.innerHTML;
}


// =============================================
// CHECK EXISTING LOGIN WHEN PAGE LOADS
// =============================================

async function initializeApp() {

    const {
        data: { session }
    } = await supabaseClient.auth.getSession();

    if (session && session.user) {

        currentUser = session.user;

        showApp();

        await loadAssignments();

    } else {

        authSection.classList.remove("hidden");
        appSection.classList.add("hidden");
    }
}

initializeApp();