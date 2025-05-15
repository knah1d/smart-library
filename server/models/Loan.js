import mongoose from 'mongoose';

const loanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  issueDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: ['ACTIVE', 'RETURNED', 'OVERDUE'],
    default: 'ACTIVE'
  },
  extensionsCount: {
    type: Number,
    default: 0,
    min: 0
  }
});

// Update status to OVERDUE if book is not returned and due date has passed
loanSchema.pre('save', function(next) {
  if (this.status === 'ACTIVE' && !this.returnDate && this.dueDate < new Date()) {
    this.status = 'OVERDUE';
  }
  next();
});

const Loan = mongoose.model('Loan', loanSchema);

export default Loan; 