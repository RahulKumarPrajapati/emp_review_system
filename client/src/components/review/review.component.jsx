import React, { useEffect, useState } from 'react';
import { API_URL, REVIEW_MESSAGE, ALERT_MESSAGE } from '../../shared/CONSTANT.js'
import axios from 'axios';
import Pagination from "react-js-pagination";
import Modal from 'react-bootstrap/Modal';

const Review = () => {
  const [reviews, setReviews] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isViewing, setView] = useState(false);
  const [isEditing, setEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    employeeId: '',
    evaluationPeriod: 1,
    productivity: 0,
    teamwork: 0,
    punctuality: 0,
    communication: 0,
    problemSolving: 0,
    feedback: ''
  });
  const [activePage, setActivePage] = useState(1);
  const [totalReviews, setTotalReviews] = useState(0);
  const itemsPerPage = 5;
  const [show, setShow] = useState(false);
  const [feedback, setFeedback] = useState([]);
  const handleModalClose = () => setShow(false);
  const handleModalShow = () => setShow(true);
  const [showFeedback, setShowFeedback] = useState(false);
  const handleFeedbackClose = () => setShowFeedback(false);
  const handleFeedbackShow = () => setShowFeedback(true);
  const [showPreview, setShowPreview] = useState(false);
  const [preview, setPreview] = useState({name: '', reviews: []});
  const handlePreviewClose = () => setShowPreview(false);
  const handlePreviewShow = () => setShowPreview(true);
  
  const handlePageChange = (pageNumber) => {
      setActivePage(pageNumber);
      getAllReviews(pageNumber);
  };

  useEffect(() => {
    const fetchReviews = async () => {
      await getAllReviews(activePage);
    };
    fetchReviews();
  }, []);

  const getAllReviews = async (pageNumber) => {
      try{
        const response = await axios.get(API_URL + 'getAllReviews',
        {
          params : {
              skip: (pageNumber - 1) * itemsPerPage,
              limit: itemsPerPage
          }
        }
      );
      setReviews(response.data.reviewData);
      setTotalReviews(response.data.totalReviews);
    }
    catch(err){
      alert('Some Error Occurred. Please try again later.')
    }
  }
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async () => {
    try{
      const isValid = formData.name.length > 0 && formData.employeeId >= 1 && formData.evaluationPeriod.length > 0 &&
        ['productivity', 'teamwork', 'punctuality', 'communication', 'problemSolving'].every(
          (field) => formData[field] >= 0 && formData[field] <= 10
        );
      if(isValid){
        if(isEditing){
          const data = {
            ...formData,
            ...{feedback: ''}
          }
          const response = await axios.post(API_URL + `edit`, data);
          await getAllReviews(activePage);
          alert(ALERT_MESSAGE[response.data.message]);
        }
        else{
          const response = await axios.post(API_URL + 'add', formData);
          alert(ALERT_MESSAGE[response.data.message]);
          
        }
        handleClose();
        await getAllReviews(activePage);
      }
      else{
        setIsError(true);
      }
    }
    catch(err){
      alert(err?.response?.data?.message ? ALERT_MESSAGE[err.response.data.message] : "Some Error Occurred");
      handleClose()
    }
  };

  const handleDelete = async (id) => {
    try{
      const response = await axios.delete(API_URL + `delete/${id}`);
      if(response.data.message == REVIEW_MESSAGE.review_deleted){
        setReviews(reviews.filter(review => review.employeeId !== id));
      }
      else{
        alert(ALERT_MESSAGE[response.data.message]);
      }
    }
    catch(err){
      alert(err?.response?.data?.message ? ALERT_MESSAGE[err.response.data.message] : "Some Error Occurred");
    }
  };

  const handleView = (id) => {
    setView(true);
    handleModalShow();
    let data = reviews.filter((empData) => empData._id == id)
    setFormData(
      ...data
    )
  }

  const handleClose = () => {
    handleModalClose();
    setFormData({
      name: '',
      employeeId: '',
      evaluationPeriod: '',
      productivity: 0,
      teamwork: 0,
      punctuality: 0,
      communication: 0,
      problemSolving: 0,
      feedback: ""
    })
    setIsError(false);
    setView(false);
    setEdit(false);
  }

  const handleEdit = async (id) => {
    setEdit(true);
    let data = reviews.filter((empData) => empData._id == id);
    setFormData(
      ...data
    )
    handleModalShow();
  }

  const handleFeedback = async (id) => {
    try{  
      let data = reviews.filter((empData) => empData._id == id)[0];
      const response = await axios.post(API_URL + "generate-feedback", data);
      let empData = reviews.map((emp) => {
        if(emp._id == id){
          return {
            ...emp,
            feedback: response.data.feedback,
            feedbackGenerated: true
          }
        }
        else{
          return emp;
        }
      })
      setReviews(empData);
      alert(ALERT_MESSAGE[response.data.message]);
    }
    catch(err){
      alert('Some Error Occurred. Please try again later.')
    }
  }

  const handleFeedbackView = (id) => {
    let data = reviews.filter((empData) => empData._id == id)[0];
    if(data.feedback.length){
      // setShowFeedback(true);
      handleFeedbackShow();
      setFeedback(data.feedback.split('\n'));
    }
    else{
      alert('No Feedback Found')
    }
  }

  const handlePreview = async (id) => {
    try{  
      const response = await axios.get(API_URL + `generate-preview/${id}`);
      handlePreviewShow();
      if(response.data.length){
        setPreview(response.data[0])
      }
      else{
        alert('No Preview Found')
      }
    }
    catch(err){
      alert('Some Error Occurred. Please try again later.')
    }
  }

  const convertToCSV = (data) => {
    let headers = [];
    for(let key of Object.keys(data.reviews[0])){
      if(key != '_id' && key != 'feedback' && key != '__v'){
        headers.push(key);
      }
    }
    const rows = data.reviews.map(item => {
      let data = [];
      for(let key of Object.keys(item)){
        if(key != '_id' && key != 'feedback' && key != '__v'){
          data.push(item[key]);
        }
      }
      return data.join(",");
    });
    
    return [headers.join(","), ...rows].join("\n");
  }

  const  downloadCSV = (csv, filename) => {
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");

      if (link.download !== undefined) {
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
      }
  }

  const handleDownload = async (id) => {
    try{
      const response = await axios.get(API_URL + `report-download/${id}`);
      if(response.data.length){
        const data = convertToCSV(response.data[0]);
        downloadCSV(data, 'employee-report');
      }
      else{
        alert('No Data Found')
      }
    }
    catch(err){
      alert('Some Error Occurred. Please try again later.')
    }
  }

  const handlePreviewFeedbackView = (id) => {
    const data = preview.reviews.filter((prev) => prev._id == id);
    if(data[0].feedback.length){
      setFeedback(data[0].feedback.split('\n'));
      handleFeedbackShow();
    }
    else{
      alert('No feedback found for current evaluation period.')
    }
  }
  
  return (
    <div className="container">
      <div className="d-flex justify-content-end">
        <button className="btn btn-primary" onClick={handleModalShow}>Add Review</button>
      </div>
      <div className="mt-2">
        <table className="table">
          <thead className='table-dark'>
            <tr>
              <th className='text-center'>Name</th>
              <th className='text-center'>Productivity</th>
              <th className='text-center'>Teamwork</th>
              <th className='text-center'>Punctuality</th>
              <th className='text-center'>Communication</th>
              <th className='text-center'>Problem Solving</th>
              <th className='text-center'>Actions</th>
              <th className='text-center'>Feedback</th>
              <th className='text-center'>Preview</th>
            </tr>
          </thead>
          <tbody>
            {reviews.length ? reviews.map((review) => (
              <tr key={review._id}>
                <td className='text-center'>{review.name}</td>
                <td className='text-center'>{review.productivity}</td>
                <td className='text-center'>{review.teamwork}</td>
                <td className='text-center'>{review.punctuality}</td>
                <td className='text-center'>{review.communication}</td>
                <td className='text-center'>{review.problemSolving}</td>
                <td className='text-center text-nowrap'>
                  <button className = "btn btn-danger" onClick={() => handleDelete(review.employeeId)}><i className="fa fa-solid fa-trash"></i></button>
                  <button className = "btn btn-primary ms-1" onClick={() => handleView(review._id)} ><i className="fa fa-solid fa-eye"></i></button>
                  <button className = "btn btn-primary ms-1" onClick={() => handleEdit(review._id)} ><i className="fa fa-solid fa-edit"></i></button>
                </td>
                <td className='text-center text-nowrap'>
                  <button className = "btn btn-success" onClick={() => handleFeedback(review._id)} disabled={review.feedbackGenerated ? true : null}>Generate</button>
                  <button className = "btn btn-primary ms-2" onClick={() => handleFeedbackView(review._id)}>View</button>
                </td>
                <td className='text-center text-nowrap'>
                  <button className = "btn btn-primary ms-1" onClick={() => handlePreview(review.employeeId)} >View</button>
                  <button className = "btn btn-primary ms-1" onClick={() => handleDownload(review.employeeId)} ><i className="fa fa-solid fa-download"></i></button>
                </td>
              </tr>
              )) : <tr><td className="text-center text-nowrap" colSpan="9">No data Available</td></tr>
            }
          </tbody>
        </table>
        { reviews.length ? (
          <div className="d-flex justify-content-center mt-4">
            <Pagination
            activePage={activePage}
            itemsCountPerPage={itemsPerPage}
            totalItemsCount={totalReviews}
            pageRangeDisplayed={5}
            onChange={handlePageChange}
            itemClass="page-item"
            linkClass="page-link"
            />
          </div>
          ) : ""
        }
      </div>
      <Modal show={show} onHide={handleClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>{isViewing ? 'View' : isEditing ? 'Edit' : 'Add'} Employee Review</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="d-flex justify-content-between">
            <div className="form-group col-5">
              <label htmlFor="name"><b>Employee Name</b></label>
              <input type="text" className="form-control" id="name" name="name" placeholder="Employee Name" value={formData.name} disabled={isViewing ? true : null} onChange={handleChange} />
            </div>

            <div className="form-group col-5">
              <label htmlFor="employeeId">Employee ID</label>
              <input type="number" className="form-control" id="employeeId" name="employeeId" placeholder="Employee ID" value={formData.employeeId} min="1" disabled={isViewing || isEditing ? true : null} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group col-5 mt-2">
            <label htmlFor="evaluationPeriod"><b>Evaluation Period</b></label>
            <input type="text" className="form-control" id="evaluationPeriod" name="evaluationPeriod" placeholder="Evaluation Period" value={formData.evaluationPeriod} disabled={isViewing ? true : null} onChange={handleChange} />
          </div>
          <div className="d-flex justify-content-center mt-2">
            <span><b>Rate Performance</b></span>
          </div>
          <div className="d-flex justify-content-between mt-2">
            <div className="form-group col-5">
              <label htmlFor="productivity"><b>Productivity</b></label>
              <input type="number" className="form-control" id="productivity" name="productivity" placeholder="Productivity" value={formData.productivity} min="0" max="10" disabled={isViewing ? true : null} onChange={handleChange} />
            </div>

            <div className="form-group col-5">
              <label htmlFor="teamwork"><b>Teamwork</b></label>
              <input type="number" className="form-control" id="teamwork" name="teamwork" placeholder="Teamwork" value={formData.teamwork} min="0" max="10" disabled={isViewing ? true : null} onChange={handleChange} />
            </div>
          </div>

          <div className="d-flex justify-content-between mt-2">
            <div className="form-group col-5">
              <label htmlFor="punctuality"><b>Punctuality</b></label>
              <input type="number" className="form-control" id="punctuality" name="punctuality" placeholder="Punctuality" value={formData.punctuality} min="0" max="10"disabled={isViewing ? true : null} onChange={handleChange} />
            </div>

            <div className="form-group col-5">
              <label htmlFor="communication"><b>Communication</b></label>
              <input type="number" className="form-control" id="communication" name="communication" placeholder="Communication" value={formData.communication} min="0" max="10" disabled={isViewing ? true : null} onChange={handleChange} />
            </div>
          </div>

          <div className="form-group col-5 mt-2">
            <label htmlFor="problemSolving"><b>Problem-solving</b></label>
            <input type="number" className="form-control" id="problemSolving" name="problemSolving" placeholder="Problem-solving" value={formData.problemSolving} min="0" max="10" disabled={isViewing ? true : null} onChange={handleChange} />
          </div>
          {isError && 
            <div className="mt-2">
              <div className="text-danger">Enter all values correctly</div>
            </div>
          }
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={handleClose}>Close</button>
          { !isViewing &&
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>{isEditing ? 'Edit' : 'Add'}</button>
          }
        </Modal.Footer>
      </Modal>
      <Modal show={showFeedback} onHide={handleFeedbackClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='d-flex flex-column'>
            {feedback.map((data, index) => {
              return <span key={index}>{data}</span>
            })}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={handleFeedbackClose}>Close</button>
        </Modal.Footer>
      </Modal>
      <Modal size="lg" show={showPreview} onHide={handlePreviewClose} backdrop="static" keyboard={false}>
        <Modal.Header closeButton>
          <Modal.Title>Employee Feedback Preview History</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className='mt-2'>
            <table className="table">
            <thead className='table-dark'>
              <tr>
                <th className='text-center'>Evaluation Period</th>
                <th className='text-center'>Productivity</th>
                <th className='text-center'>Teamwork</th>
                <th className='text-center'>Punctuality</th>
                <th className='text-center'>Communication</th>
                <th className='text-center'>Problem Solving</th>
                <th className='text-center'>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {preview ? preview.reviews.map((prev, ind) => (
                <tr key={prev._id}>
                  <td className='text-center'>{prev.evaluationPeriod}</td>
                  <td className='text-center'>{prev.productivity}</td>
                  <td className='text-center'>{prev.teamwork}</td>
                  <td className='text-center'>{prev.punctuality}</td>
                  <td className='text-center'>{prev.communication}</td>
                  <td className='text-center'>{prev.problemSolving}</td>
                  <td className='text-center text-nowrap'>
                    <button className = "btn btn-primary ms-1" onClick={() => handlePreviewFeedbackView(prev._id)} ><i className="fa fa-solid fa-eye"></i></button>
                  </td>
                </tr>
                )) : <tr><td className="text-center text-nowrap" colSpan="7">No data Available</td></tr>
              }
            </tbody>
          </table>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <button type="button" className="btn btn-secondary" onClick={handlePreviewClose}>Close</button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Review;
