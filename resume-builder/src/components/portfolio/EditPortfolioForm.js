import React, { useState } from "react";

const inputClass =
  "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white";

const EditPortfolioForm = ({ initialData, onSubmit }) => {
  const [portfolioData, setPortfolioData] = useState(initialData || {});

  // ─────────────── Generic Handlers ───────────────

  const handleChange = (field, value) => {
    setPortfolioData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNestedChange = (parent, field, value) => {
    setPortfolioData((prev) => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value,
      },
    }));
  };

  const handleArrayChange = (section, index, field, value) => {
    const updated = [...portfolioData[section]];
    updated[index][field] = value;

    setPortfolioData((prev) => ({
      ...prev,
      [section]: updated,
    }));
  };

  const addItem = (section, newItem) => {
    setPortfolioData((prev) => ({
      ...prev,
      [section]: [...(prev[section] || []), newItem],
    }));
  };

  const removeItem = (section, index) => {
    const updated = [...portfolioData[section]];
    updated.splice(index, 1);

    setPortfolioData((prev) => ({
      ...prev,
      [section]: updated,
    }));
  };

  // ─────────────── Submit ───────────────

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(portfolioData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ───────────── Personal Info ───────────── */}
      <div className="border-b pb-6">
        <h2 className="text-xl font-semibold mb-4">Personal Info</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="Name"
            value={portfolioData.name || ""}
            onChange={(e) => handleChange("name", e.target.value)}
            className={inputClass}
          />

          <input
            placeholder="Email"
            value={portfolioData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
            className={inputClass}
          />

          <input
            placeholder="Role"
            value={portfolioData.currentRole || ""}
            onChange={(e) => handleChange("currentRole", e.target.value)}
            className={inputClass}
          />

          <input
            placeholder="Company"
            value={portfolioData.currentCompany || ""}
            onChange={(e) => handleChange("currentCompany", e.target.value)}
            className={inputClass}
          />
        </div>

        <textarea
          placeholder="Bio"
          className={`${inputClass} mt-4`}
          value={portfolioData.bio || ""}
          onChange={(e) => handleChange("bio", e.target.value)}
        />
      </div>

      {/* ───────────── Socials ───────────── */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Social Links</h2>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            placeholder="LinkedIn"
            value={portfolioData.socials?.linkedin || ""}
            onChange={(e) =>
              handleNestedChange("socials", "linkedin", e.target.value)
            }
            className={inputClass}
          />

          <input
            placeholder="GitHub"
            value={portfolioData.socials?.github || ""}
            onChange={(e) =>
              handleNestedChange("socials", "github", e.target.value)
            }
            className={inputClass}
          />
        </div>
      </div>

      {/* ───────────── Experience ───────────── */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Experience</h2>

        {portfolioData.experience?.map((exp, i) => (
          <div key={i} className="mb-4 border p-4 rounded-lg space-y-2">
            <input
              placeholder="Role"
              value={exp.role}
              onChange={(e) =>
                handleArrayChange("experience", i, "role", e.target.value)
              }
              className={inputClass}
            />

            <input
              placeholder="Company"
              value={exp.company}
              onChange={(e) =>
                handleArrayChange("experience", i, "company", e.target.value)
              }
              className={inputClass}
            />

            <textarea
              placeholder="Description"
              value={exp.description}
              onChange={(e) =>
                handleArrayChange("experience", i, "description", e.target.value)
              }
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => removeItem("experience", i)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            addItem("experience", {
              role: "",
              company: "",
              description: "",
              bullets: [],
              isCurrent: false,
            })
          }
          className="text-blue-500"
        >
          + Add Experience
        </button>
      </div>

      {/* ───────────── Projects ───────────── */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Projects</h2>

        {portfolioData.projects?.map((proj, i) => (
          <div key={i} className="mb-4 border p-4 rounded-lg space-y-2">
            <input
              placeholder="Title"
              value={proj.title}
              onChange={(e) =>
                handleArrayChange("projects", i, "title", e.target.value)
              }
              className={inputClass}
            />

            <textarea
              placeholder="Description"
              value={proj.description}
              onChange={(e) =>
                handleArrayChange("projects", i, "description", e.target.value)
              }
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => removeItem("projects", i)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            addItem("projects", {
              title: "",
              description: "",
              tags: [],
            })
          }
          className="text-blue-500"
        >
          + Add Project
        </button>
      </div>

      {/* ───────────── Skills ───────────── */}
      <div className="border-b pb-6">
        <h2 className="text-lg font-semibold mb-4">Skills</h2>

        {portfolioData.skills?.map((skill, i) => (
          <div key={i} className="mb-4 border p-4 rounded-lg space-y-2">
            <input
              placeholder="Skill Category"
              value={skill.label}
              onChange={(e) =>
                handleArrayChange("skills", i, "label", e.target.value)
              }
              className={inputClass}
            />

            <input
              placeholder="Details"
              value={skill.detail}
              onChange={(e) =>
                handleArrayChange("skills", i, "detail", e.target.value)
              }
              className={inputClass}
            />

            <button
              type="button"
              onClick={() => removeItem("skills", i)}
              className="text-red-500 text-sm"
            >
              Remove
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            addItem("skills", {
              label: "",
              detail: "",
              icon: "",
              color: "",
            })
          }
          className="text-blue-500"
        >
          + Add Skill
        </button>
      </div>

      {/* ───────────── Submit ───────────── */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Save Portfolio
        </button>
      </div>
    </form>
  );
};

export default EditPortfolioForm;