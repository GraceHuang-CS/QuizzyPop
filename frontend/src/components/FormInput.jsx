import React from "react";

const FormInput = ({ label, type, name, value, onChange, placeholder }) => {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <label>
        {label}
        <input
          type={type}
          name={name} // important for handleChange
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          style={{
            display: "block",
            padding: "0.5rem",
            width: "100%",
            marginTop: "0.25rem",
          }}
        />
      </label>
    </div>
  );
};

export default FormInput;
