<script setup>
import { ref, onMounted } from "vue";
import { useAuthStore } from "../store/auth";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

const authStore = useAuthStore();
const issues = ref([]);
const statuses = ["pending", "solved", "unsolved"];
const selectedStatus = ref("pending");
const filteredIssues = ref([]);
const isModalOpen = ref(false);
const selectedIssue = ref(null);
const comments = ref([]);
const newComment = ref("");

const userRole = jwtDecode(authStore.token)?.role;

const fetchIssues = async () => {
    try {
        const ressponse = await api.get("/issues");
        issues.value = response.data.issues;
        filterIssues();
    } catch (error) {
        console.error("Failed to fetch issues:", error);
    }
};

const fetchComments = async () => {
    if (!selectedIssue.value) return;
    try {
        const response = await api.get(`/issues/${selectedIssue.value.issue_id}/comments`);
        comments.value = response.data.comments;
    } catch (error) {
        console.error("Failed to load comments:", error);
    }
};

const submitComment = async () => {
    if (!newComment.value.trim()) return;
    if (!["laborants", "materiāli atbildīgā persona"].includes(userRole)) {
        alert("Jums nav tiesību pievienot komentārus.");
        return;
    }
    const userId = jwtDecode(authStore.token)?.user_id;
    try {
        await api.post(`/issues/${selectedIssue.value.issue_id}/comments`, {
            user_id: userId,
            comment: newComment.value.trim()
        });
        newComment.value = "";
        await fetchComments();
    } catch (error) {
        console.error("Failed to add comment:", error);
        alert("Neizdevās pievienot komentāru.");
    }
};

const filterIssues = () => {
    if (selectedStatus.value === "all") {
        filteredIssues.value = issues.value;
    } else {
        filteredIssues.value = issues.value.filter(issue => issue.status === selectedStatus.value);
    }
};

const openModal = async (issue) => {
    try {
        const response = await api.get(`/issues/${issue.issue_id}`);
        selectedIssue.value = response.data.issue;
        await fetchComments();
        isModalOpen.value = true;
    } catch (error) {
        console.error("Failed to load issue:", error);
        alert("Neizdevās ielādēt problēmas datus.");
    }
};

const closeModal = () => {
    isModalOpen.value = false;
    selectedIssue.value = null;
};

const updateIssueStatus = async () => {
    if (!selectedIssue.value) return;
    try {
        await api.put(`/issues/${selectedIssue.value.issue_id}/status`, {
            status: selectedIssue.value.status
        });
        const index = issues.value.findIndex(i => i.issue_id === selectedIssue.value.issue_id);
        if (index !== -1) {
            issues.value[index].status = selectedIssue.value.status;
        }
        alert("Statuss atjaunināts!");
        closeModal();
    } catch (error) {
        console.error("Failed to update status:", error);
        alert("Neizdevās atjaunināt statusu.");
    }
};

onMounted(fetchIssues);
</script>

