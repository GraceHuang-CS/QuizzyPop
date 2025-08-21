import React, { useState, useEffect } from "react";
import NavBar from "../../components/NavBar";
import MaterialCard from "../../components/MaterialCard";
import { fetchMaterials } from "../../api/studyService";
import { deleteMaterial } from "../../api/studyService";
import "../../styles/pgs/Dashboard.css";
import Overlay from "../../components/MessageOverlay";
const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [activeTab, setActiveTab] = useState("materials");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [overlayContent, setOverlayContent] = useState(null);
  // Load user and materials on component mount
  useEffect(() => {
    const loadDashboard = async () => {
      console.log("🔄 Starting to load dashboard...");

      try {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("token");

        console.log(
          "📋 User data from localStorage:",
          userData ? "Found" : "Not found"
        );
        console.log(
          "🔑 Token from localStorage:",
          token ? "Found" : "Not found"
        );

        if (userData) {
          const parsedUser = JSON.parse(userData);
          console.log("👤 Setting user:", parsedUser);
          setUser(parsedUser);
        }

        if (token) {
          console.log("🔍 Fetching materials...");

          // Add a timeout to prevent infinite loading
          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Request timeout")), 10000)
          );

          const fetchPromise = fetchMaterials(token);

          const fetchedMaterials = await Promise.race([
            fetchPromise,
            timeoutPromise,
          ]);

          console.log("📚 Materials fetched:", fetchedMaterials?.length || 0);
          setMaterials(fetchedMaterials || []);
        } else {
          console.warn("⚠️ No token found - user might not be logged in");
          setError("Please log in to view your materials");
        }

        console.log("✅ Dashboard loaded successfully");
      } catch (err) {
        console.error("❌ Failed to load dashboard:", err);
        setError(err.message || "Failed to load dashboard data");

        // Even if materials fail to load, we can still show the dashboard
        // with empty state if user data exists
        const userData = localStorage.getItem("user");
        if (userData) {
          try {
            setUser(JSON.parse(userData));
            setMaterials([]); // Set empty array so UI shows empty state
          } catch (parseErr) {
            console.error("Failed to parse user data:", parseErr);
          }
        }
      } finally {
        console.log("🏁 Setting loading to false");
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  // Listen for new materials from StudyMaterialGenerator
  useEffect(() => {
    const handleNewMaterial = (event) => {
      const { materialData } = event.detail;
      console.log("🆕 New material added:", materialData);
      // The material is already saved to DB, just update local state
      setMaterials((prev) => [materialData, ...prev]);
    };

    window.addEventListener("materialGenerated", handleNewMaterial);

    return () => {
      window.removeEventListener("materialGenerated", handleNewMaterial);
    };
  }, []);

  const handleDeleteMaterial = async (materialId) => {
    const token = localStorage.getItem("token");
    if (!materialId) {
      console.warn("Material ID is missing");
      return;
    }

    try {
      console.log("🗑️ Deleting material:", materialId);
      await deleteMaterial(materialId, token);
      setMaterials((prev) => prev.filter((m) => m._id !== materialId));
      console.log("✅ Material deleted successfully");
    } catch (err) {
      console.error("❌ Error deleting material:", err);
      setError("Failed to delete material");
    }
  };

  // Search + filter
  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      material.materialType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" || material.materialType === filterType;
    return matchesSearch && matchesFilter;
  });

  // Stats
  const materialStats = {
    total: materials.length,
    flashcards: materials.filter((m) => m.materialType === "flashcard").length,
    quizzes: materials.filter((m) => m.materialType === "quiz").length,
    summaries: materials.filter((m) => m.materialType === "summary").length,
  };

  // Add a fallback timeout to force loading to false after 15 seconds
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        console.warn("⏰ Force stopping loading after 15 seconds");
        setLoading(false);
        setError("Loading took too long. Please refresh the page.");
      }
    }, 15000);

    return () => clearTimeout(fallbackTimeout);
  }, [loading]);

  if (loading) {
    return (
      <div className="dashboard-page">
        <NavBar onOpenOverlay={setOverlayContent} />
        {overlayContent && (
          <Overlay onClose={() => setOverlayContent(null)}>
            {overlayContent}
          </Overlay>
        )}
        <div className="dashboard-container">
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading your dashboard...</p>
            <small style={{ marginTop: "10px", opacity: 0.7 }}>
              If this takes too long, please refresh the page
            </small>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <NavBar onOpenOverlay={setOverlayContent} />
      {overlayContent && (
        <Overlay onClose={() => setOverlayContent(null)}>
          {overlayContent}
        </Overlay>
      )}
      <div className="dashboard-page">
        <div className="dashboard-container">
          <div className="dashboard-header">
            <h1>Welcome back, {user?.name || user?.email || "Student"}!</h1>
            <div className="stats-overview">
              <div className="stat-card">
                <span className="stat-number">{materialStats.total}</span>
                <span className="stat-label">Total Materials</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{materialStats.flashcards}</span>
                <span className="stat-label">Flashcards</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{materialStats.quizzes}</span>
                <span className="stat-label">Quizzes</span>
              </div>
              <div className="stat-card">
                <span className="stat-number">{materialStats.summaries}</span>
                <span className="stat-label">Summaries</span>
              </div>
            </div>
          </div>

          {error && (
            <div className="error-message">
              <div className="error-icon">⚠️</div>
              <div>{error}</div>
              <button onClick={() => setError(null)} className="dismiss-error">
                ×
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="dashboard-tabs">
            <button
              className={`tab-button ${
                activeTab === "materials" ? "active" : ""
              }`}
              onClick={() => setActiveTab("materials")}
            >
              My Materials
            </button>
            <button
              className={`tab-button ${
                activeTab === "mocktest" ? "active" : ""
              }`}
              onClick={() => setActiveTab("mocktest")}
            >
              Mock Test
            </button>
          </div>

          {/* Materials tab */}
          {activeTab === "materials" && (
            <div className="materials-section">
              <div className="materials-controls">
                <div className="search-bar">
                  <input
                    type="text"
                    placeholder="Search materials..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div className="filter-dropdown">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">All Types</option>
                    <option value="flashcard">Flashcards</option>
                    <option value="quiz">Quizzes</option>
                    <option value="summary">Summaries</option>
                  </select>
                </div>
              </div>

              <div className="materials-grid">
                {filteredMaterials.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📚</div>
                    <h3>No materials found</h3>
                    <p>
                      {searchTerm || filterType !== "all"
                        ? "Try adjusting your search or filter criteria."
                        : "Create your first study material to get started!"}
                    </p>
                  </div>
                ) : (
                  filteredMaterials.map((material) => (
                    <MaterialCard
                      key={material._id}
                      material={material}
                      onDelete={() => handleDeleteMaterial(material._id)}
                    />
                  ))
                )}
              </div>
            </div>
          )}

          {/* Mock test tab */}
          {activeTab === "mocktest" && (
            <div className="mock-test-section">
              <p>Mock Test functionality - Coming soon!</p>
              {/* Replace with your MockTestSelector component */}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Dashboard;
// frontend/src/pages/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import NavBar from "../../components/NavBar";
// import MaterialCard from "../../components/MaterialCard";
// import { fetchMaterials } from "../../api/studyService";
// import { deleteMaterial } from "../../api/studyService";
// import "../../styles/pgs/Dashboard.css";

// const Dashboard = () => {
//   const [user, setUser] = useState(null);
//   const [materials, setMaterials] = useState([]);
//   const [activeTab, setActiveTab] = useState("materials");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterType, setFilterType] = useState("all");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // Load user and materials on component mount
//   useEffect(() => {
//     const loadDashboard = async () => {
//       try {
//         const userData = localStorage.getItem("user");
//         const token = localStorage.getItem("token");

//         if (userData) {
//           setUser(JSON.parse(userData));
//         }

//         if (token) {
//           const fetchedMaterials = await fetchMaterials(token);
//           setMaterials(fetchedMaterials);
//         }
//       } catch (err) {
//         console.error("Failed to load dashboard:", err);
//         setError("Failed to load dashboard data");
//       } finally {
//         setLoading(false);
//       }
//     };

//     loadDashboard();
//   }, []);

//   // Listen for new materials from StudyMaterialGenerator
//   useEffect(() => {
//     const handleNewMaterial = (event) => {
//       const { materialData } = event.detail;
//       // The material is already saved to DB, just update local state
//       setMaterials((prev) => [materialData, ...prev]);
//     };

//     window.addEventListener("materialGenerated", handleNewMaterial);

//     return () => {
//       window.removeEventListener("materialGenerated", handleNewMaterial);
//     };
//   }, []);

//   // // Delete material from DB + update state
//   // const handleDeleteMaterial = async (materialId) => {
//   //   const token = localStorage.getItem("token");
//   //   try {
//   //     const response = await fetch(
//   //       `http://localhost:5001/api/dashboard/delete-material/${materialId}`,
//   //       {
//   //         method: "DELETE",
//   //         headers: {
//   //           Authorization: `Bearer ${token}`,
//   //           "Content-Type": "application/json",
//   //         },
//   //       }
//   //     );

//   //     if (!response.ok) {
//   //       const errorData = await response.json();
//   //       throw new Error(errorData.error || "Failed to delete material");
//   //     }

//   //     // Update state after deleting
//   //     setMaterials((prev) => prev.filter((m) => m._id !== materialId));
//   //   } catch (err) {
//   //     console.error("Error deleting material:", err);
//   //     setError("Failed to delete material");
//   //   }
//   // };

//   const handleDeleteMaterial = async (materialId) => {
//     const token = localStorage.getItem("token");
//     if (!materialId) {
//       console.warn("Material ID is missing");
//       return;
//     }
//     try {
//       await deleteMaterial(materialId, token);
//       setMaterials((prev) => prev.filter((m) => m._id !== materialId));
//     } catch (err) {
//       console.error("Error deleting material:", err);
//       setError("Failed to delete material");
//     }
//   };

//   // Search + filter
//   const filteredMaterials = materials.filter((material) => {
//     const matchesSearch =
//       material.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       material.materialType.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter =
//       filterType === "all" || material.materialType === filterType;
//     return matchesSearch && matchesFilter;
//   });

//   // Stats
//   const materialStats = {
//     total: materials.length,
//     flashcards: materials.filter((m) => m.materialType === "flashcard").length,
//     quizzes: materials.filter((m) => m.materialType === "quiz").length,
//     summaries: materials.filter((m) => m.materialType === "summary").length,
//   };

//   if (loading) {
//     return (
//       <div className="dashboard-page">
//         <NavBar />
//         <div className="dashboard-container">
//           <div className="loading-state">
//             <div className="spinner"></div>
//             <p>Loading your dashboard...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="dashboard-page">
//       <Navigation />

//       <div className="dashboard-container">
//         <div className="dashboard-header">
//           <h1>Welcome back, {user?.name || user?.email || "Student"}!</h1>
//           <div className="stats-overview">
//             <div className="stat-card">
//               <span className="stat-number">{materialStats.total}</span>
//               <span className="stat-label">Total Materials</span>
//             </div>
//             <div className="stat-card">
//               <span className="stat-number">{materialStats.flashcards}</span>
//               <span className="stat-label">Flashcards</span>
//             </div>
//             <div className="stat-card">
//               <span className="stat-number">{materialStats.quizzes}</span>
//               <span className="stat-label">Quizzes</span>
//             </div>
//             <div className="stat-card">
//               <span className="stat-number">{materialStats.summaries}</span>
//               <span className="stat-label">Summaries</span>
//             </div>
//           </div>
//         </div>

//         {error && (
//           <div className="error-message">
//             <div className="error-icon">⚠️</div>
//             <div>{error}</div>
//             <button onClick={() => setError(null)} className="dismiss-error">
//               ×
//             </button>
//           </div>
//         )}

//         {/* Tabs */}
//         <div className="dashboard-tabs">
//           <button
//             className={`tab-button ${
//               activeTab === "materials" ? "active" : ""
//             }`}
//             onClick={() => setActiveTab("materials")}
//           >
//             My Materials
//           </button>
//           <button
//             className={`tab-button ${activeTab === "mocktest" ? "active" : ""}`}
//             onClick={() => setActiveTab("mocktest")}
//           >
//             Mock Test
//           </button>
//         </div>

//         {/* Materials tab */}
//         {activeTab === "materials" && (
//           <div className="materials-section">
//             <div className="materials-controls">
//               <div className="search-bar">
//                 <input
//                   type="text"
//                   placeholder="Search materials..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>
//               <div className="filter-dropdown">
//                 <select
//                   value={filterType}
//                   onChange={(e) => setFilterType(e.target.value)}
//                 >
//                   <option value="all">All Types</option>
//                   <option value="flashcard">Flashcards</option>
//                   <option value="quiz">Quizzes</option>
//                   <option value="summary">Summaries</option>
//                 </select>
//               </div>
//             </div>

//             <div className="materials-grid">
//               {filteredMaterials.length === 0 ? (
//                 <div className="empty-state">
//                   <div className="empty-icon">📚</div>
//                   <h3>No materials found</h3>
//                   <p>
//                     {searchTerm || filterType !== "all"
//                       ? "Try adjusting your search or filter criteria."
//                       : "Create your first study material to get started!"}
//                   </p>
//                 </div>
//               ) : (
//                 filteredMaterials.map((material) => (
//                   <MaterialCard
//                     key={material._id}
//                     material={material}
//                     onDelete={() => handleDeleteMaterial(material._id)}
//                   />
//                 ))
//               )}
//             </div>
//           </div>
//         )}

//         {/* Mock test tab */}
//         {activeTab === "mocktest" && (
//           <MockTestSelector
//             materials={materials.filter((m) => m.materialType === "quiz")}
//           />
//         )}
//       </div>
//     </div>
//   );
// };

// export default Dashboard;
