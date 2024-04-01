import ReactDom from "react-dom";
import React from "react";
import { AiOutlineClose } from "react-icons/ai";

const Backdrop = () => {
  return <div className="fixed top-0 left-0 w-screen h-screen z-30 bg-black opacity-10"></div>;
};

const ModalOverlay = ({ patentTitle, matchedPatentDocuments, onClose }) => {
  return (
    <div className="flex fixed h-screen w-screen z-40 items-center justify-center">
      <div className="relative z-20 max-w-3xl min-w-[80vw] bg-white p-2.5 shadow-lg">
        <header className="bg-white p-4 flex justify-between items-start text-gray-900">
          <h2 className="m-0 font-semibold">{patentTitle}</h2>
          <AiOutlineClose className=" text-gray-900 text-2xl" onClick={onClose} />
        </header>
        <hr />
        <div className="text-black bg-white p-4 h-[70vh] overflow-scroll">
          {matchedPatentDocuments.map((document) => (
            <div className="m-2.5">
              <h4>Title : {document.title}</h4>
              <h6>Probability : {document.probability}</h6>
            </div>
          ))}
          {matchedPatentDocuments.length == 0 && <h2 className="text-center">No Patent Matched</h2>}
        </div>
      </div>
    </div>
  );
};

const ValidatePatentModal = ({
  patentTitle,
  matchedPatentDocuments,
  onClose,
}) => {
  return (
    <>
      {ReactDom.createPortal(
        <Backdrop />,
        document.getElementById("overlay-root")
      )}
      {ReactDom.createPortal(
        <ModalOverlay
          patentTitle={patentTitle}
          matchedPatentDocuments={matchedPatentDocuments}
          onClose={onClose}
        />,
        document.getElementById("modal-root")
      )}
    </>
  );
};

export default ValidatePatentModal;
