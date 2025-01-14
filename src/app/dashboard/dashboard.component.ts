import { Component, OnInit } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Router } from '@angular/router';
import { FileUploadService } from '../../services/file-upload.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  activeTab: string = 'general';
  user: any = null;
  totalPatients: number = 0;
  appointments: any[] = [];
  patients: any[] = [];
  showLogoutOptions: boolean = false;
  showAddPatientForm: boolean = false;
  newPatient: any = {};
  selectedPatient: any = null;
  selectedFile: File | null = null;
  extractedData: any = null;
  medicalRecord: any = null;
  showAddAppointmentForm: boolean = false;
  newAppointment: any = {};
  currentDate: Date = new Date();
  selectedDate: Date = new Date();


  constructor(private firestore: AngularFirestore, private auth: AngularFireAuth, private router: Router, private fileUploadService: FileUploadService) {}

  ngOnInit(): void {
    this.auth.authState.subscribe(user => {
      if (user) {
        this.firestore.collection('doctors').doc(user.uid).valueChanges().subscribe(userData => {
          this.user = userData;
          this.fetchAppointments();
        });
      }
    });
    this.fetchTotalPatients();
    this.fetchPacients();
  }

  fetchTotalPatients() {
    this.firestore.collection('patients').get().subscribe((snapshot) => {
      this.totalPatients = snapshot.size;
    });
  }

  fetchAppointments() {
    if (this.user?.email) {
      this.firestore
        .collection('appointments', ref => ref.where('docEmail', '==', this.user.email))
        .valueChanges()
        .subscribe(data => {
          this.appointments = data;
        });
    }
  }

  fetchPacients() {
    this.firestore.collection('patients').valueChanges().subscribe((data) => {
      this.patients = data;
    });
  }

  setActiveTab(tab: string) {
    this.activeTab = tab;
  }

  toggleLogoutOptions() {
    this.showLogoutOptions = !this.showLogoutOptions;
  }

  logout(): void {
    localStorage.removeItem('loggedInEmail');
    this.router.navigate(['/login']);
  }

  openAddPatientForm() {
    this.showAddPatientForm = true;
    this.newPatient = { status: 'En atencion' };
  }

  closeAddPatientForm() {
    this.showAddPatientForm = false;
  }

  addNewPatient() {
    const patientData = {
      ...this.newPatient,
      date: new Date(),
      nextAppointment: null,
    };
    this.firestore.collection('patients').add(patientData).then(() => {
      this.fetchPacients();
      this.closeAddPatientForm();
    });
  }

  updatePatientStatus(patient: any) {
    this.firestore.collection('patients').doc(patient.id).update({ status: patient.status });
  }

  updateNextAppointment(patient: any) {
    this.firestore.collection('patients').doc(patient.id).update({ nextAppointment: patient.nextAppointment });
  }

  viewPatientProfile(patient: any) {
    this.selectedPatient = patient;
    this.setActiveTab('profile');
    
    // Fetch the medical record for the selected patient
    this.firestore.collection('medical records', ref =>
      ref.where('nombres', '==', patient.name)
         .where('apellidos', '==', patient.surname)
    ).valueChanges().subscribe((records) => {
      if (records.length > 0) {
        this.medicalRecord = records[0]; // Assuming one record per patient
      } else {
        this.medicalRecord = null; // No record found
      }
    });
  }

  calculateAge(birthdate: Date): number {
    const birth = new Date(birthdate);
    const ageDiff = Date.now() - birth.getTime();
    const ageDate = new Date(ageDiff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
  

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  uploadFile() {
    if (this.selectedFile) {
      this.fileUploadService.uploadFile(this.selectedFile).subscribe(
        (response) => {
          console.log('File uploaded successfully:', response);
        },
        (error) => {
          console.error('Error uploading file:', error);
        }
      );
    } else {
      console.error('No file selected!');
    }
  }
  
  saveExtractedData(): void {
    if (!this.extractedData) {
      alert("No data to save!");
      return;
    }
  
    this.firestore.collection('patients').add(this.extractedData).then(() => {
      alert("Patient data saved successfully!");
      this.fetchPacients();
      this.extractedData = null; // Clear extracted data after saving
    });
  }
  
  openAddAppointmentForm() {
    this.showAddAppointmentForm = true;
    this.newAppointment = {};
  }
  
  closeAddAppointmentForm() {
    this.showAddAppointmentForm = false;
  }
  
  addAppointment() {
    if (this.user?.email) {
      const appointmentData = { ...this.newAppointment, docEmail: this.user.email, date: this.selectedDate, type: 'Primera cita' };
      this.firestore.collection('appointments').add(appointmentData).then(() => {
        alert('Appointment added successfully');
        this.newAppointment = {}; // Reset form
        this.fetchAppointments();
      });
    }
  }


  
}
