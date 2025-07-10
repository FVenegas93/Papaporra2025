import React, { useState, useEffect } from 'react';
import { addUser, getUsers } from "../services/airtableServiceUser";
import { getTeams } from '../services/airtableServiceTeam';
import SHA256 from "crypto-js/sha256";
import { useNavigate } from "react-router-dom";
import '../styles/Register.css';
import '../styles/MainStyle.css';


const Register = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [maxStepReached, setMaxStepReached] = useState(1); // nuevo estado para control de errores visibles
  const [newUser, setFormData] = useState({
    Name: "",
    Surname1: "",
    Surname2: "",
    Email: "",
    Password: "",
    Money_Bet: "",
    Sex_Orientation: "",
    Religion: "",
    Fav_Player: "",
    Fav_Manager: "",
    Fav_Football_Sentence: "",
    Top_Scorer: "",
    Top_Assist: "",
    Winner: "",
    Runner_Up: "",
    Semifinalist1: "",
    Semifinalist2: "",
  });

  const fieldLabels = {
    Name: "Nombre",
    Surname1: "Primer Apellido",
    Surname2: "Segundo Apellido (opcional)",
    Email: "Correo Electrónico",
    Password: "Contraseña",
    Money_Bet: "Dineros que vas a palmar",
    Sex_Orientation: "Orientación Sexual",
    Religion: "Religión",
    Fav_Player: "Jugador más icónico de la historia",
    Fav_Manager: "Mejor entrenador de la historia",
    Fav_Football_Sentence: "Mejor frase dicha en el balompié",
    Top_Scorer: "Máximo Goleador",
    Top_Assist: "Máximo Asistente",
    Winner: "Ganador",
    Runner_Up: "Subcampeón",
    Semifinalist1: "Semifinalista 1",
    Semifinalist2: "Semifinalista 2",
  };

  const [errors, setErrors] = useState({});
  const [existingEmails, setExistingEmails] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const users = await getUsers(); // Obtén la lista de usuarios
        const emails = users.map((user) => user.Email);
        setExistingEmails(emails);
      } catch (error) {
        console.error("Error al obtener correos:", error);
      }
    };
    fetchEmails();
  }, []);

  const stepFields = {
    1: ["Name", "Surname1", "Surname2", "Email", "Password", "Money_Bet"],
    2: ["Sex_Orientation", "Religion", "Fav_Player", "Fav_Manager", "Fav_Football_Sentence"],
    3: ["Top_Scorer", "Top_Assist", "Winner", "Runner_Up", "Semifinalist1", "Semifinalist2"],
  };

  const stepOfField = (fieldName) => {
    for (const [step, fields] of Object.entries(stepFields)) {
      if (fields.includes(fieldName)) return parseInt(step);
    }
    return 0;
  };

  const validateField = (name, value,) => {
    let error = "";
    const specialCharRegex = /[,;'"!#$%^&*()_+=<>?/{}|~`[\]\\]/;

    if (name === "Email" && value) {
      const emailRegex = /^[^\s@]+@(gmail\.com|yahoo\.com|hotmail\.com)$/;
      if (!emailRegex.test(value)) {
        error = "Por favor, introduce un correo válido.";
      }
      if (existingEmails.includes(value)) {
        return "Ya existe una cuenta con el correo ingresado.";
      }
    }

    if (name === "Surname2") {
      if (specialCharRegex.test(value)) {
        return "No se permiten caracteres especiales.";
      } else {
        return "";
      }
    }

    if (specialCharRegex.test(value)) {
      return "No se permiten caracteres especiales.";
    }

    if (name === "Password" && value) {
      if (value.length < 8 || value.length > 16) {
        error = "La contraseña debe tener entre 8 y 16 caracteres.";
      }
    }

    if (name === "Money_Bet") {
      if (!value.trim()) {
        return "Por favor, introduce un número válido.";
      }
      if (isNaN(value) || parseFloat(value) <= 0) {
        return "Por favor, introduce un número válido y mayor a 0.";
      }
    } else if (!value.trim()) {
      return "Este campo es obligatorio.";
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData({
      ...newUser,
      [name]: value,
    });

    const error = validateField(name, value);
    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: error,
    }));
  };

  const renderStepFields = () =>
    stepFields[currentStep].map((field) => (
      <div key={field} className="mb-4 form-floating">
        <input
          type={
            field === "Password"
              ? "password"
              : field === "Money_Bet"
                ? "number"
                : "text"
          }
          name={field}
          id={field}
          placeholder=" "
          value={newUser[field]}
          onChange={handleChange}
          className={`form-control ${errors[field] && stepOfField(field) <= maxStepReached ? "is-invalid" : newUser[field].trim() ? "is-valid" : ""
            }`}
        />
        <label htmlFor={field} className="floating-input">
          {fieldLabels[field]}:
        </label>
        {errors[field] && stepOfField(field) <= maxStepReached && <div className="invalid-feedback">{errors[field]}</div>}
      </div>
    ));

  const handleNextStep = () => {
    const currentFields = stepFields[currentStep];
    const validationErrors = {};

    currentFields.forEach((field) => {
      const error = validateField(field, newUser[field]);
      if (error) {
        validationErrors[field] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        ...validationErrors,
      }));
      alert("Corrige los campos del formulario antes de continuar.");
      return;
    }

    // Eliminar errores del paso actual si son corregidos
    setErrors((prevErrors) => {
      const updatedErrors = { ...prevErrors };
      currentFields.forEach((field) => {
        delete updatedErrors[field];
      });
      return updatedErrors;
    });

    setCurrentStep((prevStep) => {
      const nextStep = prevStep + 1;
      if (nextStep > maxStepReached) setMaxStepReached(nextStep);
      return nextStep;
    });
  };

  const handlePreviousStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar todos los campos
    const allFields = Object.keys(newUser);
    const validationErrors = {};

    allFields.forEach((field) => {
      const error = validateField(field, newUser[field]);
      if (error) {
        validationErrors[field] = error;
      }
    });

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      alert("Corrige los errores en el formulario antes de completar el registro.");
      console.log(validationErrors);
      return;
    }

    try {
      // Hashear la contraseña antes de guardar
      const hashedPassword = SHA256(newUser.Password).toString();

      // Llamada al servicio para agregar el usuario
      await addUser({
        ...newUser,
        Password: hashedPassword,
      });

      // Mostrar el modal después de un registro exitoso
      setShowModal(true);

      // Reiniciar el formulario
      setFormData({
        Name: "",
        Surname1: "",
        Surname2: "",
        Email: "",
        Password: "",
        Money_Bet: "",
        Sex_Orientation: "",
        Religion: "",
        Fav_Player: "",
        Fav_Manager: "",
        Fav_Football_Sentence: "",
        Top_Scorer: "",
        Top_Assist: "",
        Winner: "",
        Runner_Up: "",
        Semifinalist1: "",
        Semifinalist2: "",
      });

      setErrors({});
    } catch (error) {
      console.error("Error al crear usuario", error);
      alert("Hubo un error al registrar. Intenta nuevamente.");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    navigate("/");
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-4 max-w-md mx-auto bg-light border rounded shadow skeleton-loader bg-reg">
        <h4 className="text-center bottom-pad step-text">Paso {currentStep} de 3</h4>
        <hr className='separator' />
        {renderStepFields()}
        <div className="d-flex justify-content-between mt-4">
          {currentStep === 1 && (
            <button
              type="submit"
              className="btn btn-secondary gradient-btn"
              onClick={(e) => {
                e.preventDefault(); // evita navegación predeterminada
                navigate("/");
              }}>
              Volver al Login</button>
          )}
          {currentStep > 1 && (
            <button type="button" className="btn btn-secondary gradient-btn" onClick={handlePreviousStep}>
              &lt; Atrás
            </button>
          )}
          {currentStep < 3 && (
            <button type="button" className="btn btn-primaty gradient-btn" onClick={handleNextStep}>Siguiente</button>
          )}
          {currentStep === 3 && (
            <button type="submit" className="btn btn-secondary gradient-btn">Completar Registro</button>
          )}
        </div>
      </form>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Registro Exitoso</h5>
                <button type="button" className="btn-close" aria-label="Close" onClick={handleModalClose}></button>
              </div>
              <div className="modal-body">
                <p>Te has registrado correctamente. Ahora puedes iniciar sesión.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={handleModalClose}>
                  Ir al Login
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Register;
