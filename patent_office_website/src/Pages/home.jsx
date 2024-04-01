import axios from "axios";
import { useEffect, useState } from "react";
import PatentCard from "../Components/patent_card";
import { InfinitySpin } from "react-loader-spinner";
import ValidatePatentModal from "../Components/validate_dialog";
import NavBar from "../Components/navbar";

const Homepage = () => {
  const [pendingDocuments, setPendingDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isValidateOpen, setIsValidateOpen] = useState(false);
  const [validatedPatents, setValidatedPatents] = useState([]);
  const [validatePatentTitle, setValidatePatentTitle] = useState("");
  const toggleIsValidate = () => setIsValidateOpen(!isValidateOpen);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await axios.post(
          "http://127.0.0.1:5000/patentOffice/pendingPatents",
          {},
          {
            withCredentials: true,
          }
        );
        setPendingDocuments([...result.data.documents]);
        setLoading(false);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, []);

  const removePatent = (title) => {
    setPendingDocuments(
      pendingDocuments.filter((document) => document.title != title)
    );
  };

  if (loading) {
    return (
      <div>
        <InfinitySpin color="#0171d3" />
      </div>
    );
  }

  return (
    <>
      {isValidateOpen && (
        <ValidatePatentModal
          patentTitle={validatePatentTitle}
          onClose={toggleIsValidate}
          matchedPatentDocuments={validatedPatents}
        />
      )}
      <NavBar activePage="Home" />

      <div>
        {pendingDocuments?.map((document, index) => (
          <PatentCard
            key={index}
            title={document.title}
            abstract={document.abstract}
            contractAddress={document.contractAddress}
            removePatent={removePatent}
            setLoading={setLoading}
            toggleIsValidate={toggleIsValidate}
            validatedPatents={validatedPatents}
            setValidatedPatents={setValidatedPatents}
            setValidatePatentTitle={setValidatePatentTitle}
          />
        ))}
      </div>
    </>
  );
};

export default Homepage;
