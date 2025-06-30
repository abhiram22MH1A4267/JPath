// const mongoose = require('mongoose');
// const bcrypt = require('bcrypt'); // ✅ Import bcrypt

// const SignUpDetail_Schema = new mongoose.Schema({
//   Name: { type: String, required: true },
//   RollNo: { type: String, unique: true, required: true },
//   Email: { type: String, unique: true, required: true },
//   Password: { type: String, required: true },
//   CertificationLinks: { type: [String], default: [] }
// });

// const SignUpDB = mongoose.model("SignUpDB", SignUpDetail_Schema);

// module.exports ={SignUpDB}


const mongoose = require('mongoose');
const bcrypt = require('bcrypt'); // ✅ Import bcrypt

const SignUpDetail_Schema = new mongoose.Schema({
  Name: { type: String, required: true },
  RollNo: { type: String, unique: true, required: true },
  Email: { type: String, unique: true, required: true },
  Password: { type: String, required: true },
  CertificationLinks: { type: [String], default: [] },
  Resume: {
    uri: { type: String, default: '' },
    name: { type: String, default: '' },
  },
  completedJobRoles : { type: [String], default: [] },
  profileImage : { type: String, default: '' },
});
  
// Job Role subdocument schema
const JobRoleSchema = new mongoose.Schema({
  roleName: {type: String,required: true,trim: true, },
  description: {type: String,required: true,trim: true, },
  requiredSkills: {type: [String],required: true,
    validate: {
      validator: function(arr) {return arr.length > 0;},
      message: 'There must be at least one required skill',
    },
  },
  experience: {type: String,required: true,trim: true, },
  salary: {type: String,required: true,trim: true, },
  companyNames: {type: [String],required: true,
    validate: {
      validator: function(arr) {return arr.length > 0;},
      message: 'There must be at least one company name',
    },
  },
});

// Job Category schema
const JobCategorySchema = new mongoose.Schema({
  categoryName: {type: String,required: true,unique: true,trim: true, },
  jobRoles: {type: [JobRoleSchema],default: [], },
});


const SignUpDB = mongoose.model("SignUpDB", SignUpDetail_Schema);
const JobCategory = mongoose.model('JobCategory', JobCategorySchema);

module.exports ={SignUpDB,JobCategory}