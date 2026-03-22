import mongoose from 'mongoose';

const interactionSchema = new mongoose.Schema({
  studentId: { 
    type: String, 
    required: true, 
    default: "demo_student_01" 
  },
  questionAsked: { 
    type: String, 
    required: true 
  },
  coreConcept: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
});

export default mongoose.model('Interaction', interactionSchema);