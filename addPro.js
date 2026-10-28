/* ===== addPro.js | Client-side validation for the Add Profile form ===== */
(function () {
    'use strict';

    var MAX_IMAGE_SIZE = 100 * 1024; // 100 KB
    var ALLOWED_TYPES = ['image/jpeg', 'image/png'];

    var form = document.getElementById('profileForm');
    if (!form) { return; }

    var f = {
        id:          form.querySelector('input[name="id"]'),
        employeeId:  document.getElementById('employeeId'),
        name:        document.getElementById('employeeName'),
        dob:         document.getElementById('dob'),
        gender:      document.getElementById('gender'),
        phone:       document.getElementById('phone'),
        department:  document.getElementById('department'),
        designation: document.getElementById('designation'),
        joiningDate: document.getElementById('joiningDate'),
        address:     document.getElementById('address'),
        photo:       document.getElementById('photo')
    };
    var preview = document.getElementById('preview');
    var photoError = document.getElementById('photoError');

    var namePattern = /^[A-Za-z][A-Za-z .'-]*$/;
    var textPattern = /^[A-Za-z][A-Za-z &.\-]*$/;
    var phonePattern = /^[6-9]\d{9}$/;

    /* ---------- helpers ---------- */
    function todayStr() {
        var d = new Date();
        var m = ('0' + (d.getMonth() + 1)).slice(-2);
        var day = ('0' + d.getDate()).slice(-2);
        return d.getFullYear() + '-' + m + '-' + day;
    }

    function errorSpan(input) {
        var group = input.closest('.form-group');
        var span = group.querySelector('.js-error');
        if (!span) {
            span = document.createElement('span');
            span.className = 'error js-error';
            group.appendChild(span);
        }
        return span;
    }

    function setError(input, message) {
        if (input === f.photo) {
            photoError.textContent = message;
        } else {
            errorSpan(input).textContent = message;
        }
        input.classList.add('invalid');
        return false;
    }

    function clearError(input) {
        if (input === f.photo) {
            photoError.textContent = '';
        } else {
            errorSpan(input).textContent = '';
        }
        input.classList.remove('invalid');
        // hide any server-side message for this field once the user edits it
        var group = input.closest('.form-group');
        group.querySelectorAll('.error:not(.js-error)').forEach(function (s) {
            if (s.id !== 'photoError') { s.style.display = 'none'; }
        });
        return true;
    }

    /* ---------- field validators ---------- */
    var validators = {
        employeeId: function () {
            var v = f.employeeId.value.trim();
            if (!v) { return setError(f.employeeId, 'Employee ID is required.'); }
            if (!/^\d+$/.test(v)) { return setError(f.employeeId, 'Employee ID must contain digits only.'); }
            if (v.length > 9) { return setError(f.employeeId, 'Employee ID can have at most 9 digits.'); }
            if (Number(v) <= 0) { return setError(f.employeeId, 'Employee ID must be greater than 0.'); }
            return clearError(f.employeeId);
        },
        name: function () {
            var v = f.name.value.trim();
            if (!v) { return setError(f.name, 'Employee name is required.'); }
            if (v.length < 3 || v.length > 50) { return setError(f.name, 'Name must be 3 to 50 characters.'); }
            if (!namePattern.test(v)) { return setError(f.name, 'Name can contain letters and spaces only.'); }
            return clearError(f.name);
        },
        dob: function () {
            var v = f.dob.value;
            if (!v) { return setError(f.dob, 'Date of birth is required.'); }
            if (v >= todayStr()) { return setError(f.dob, 'Date of birth must be in the past.'); }
            var birth = new Date(v), now = new Date();
            var age = now.getFullYear() - birth.getFullYear();
            var m = now.getMonth() - birth.getMonth();
            if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) { age--; }
            if (age < 18) { return setError(f.dob, 'Employee must be at least 18 years old.'); }
            if (age > 70) { return setError(f.dob, 'Please enter a valid date of birth.'); }
            return clearError(f.dob);
        },
        gender: function () {
            if (!f.gender.value) { return setError(f.gender, 'Please select gender.'); }
            return clearError(f.gender);
        },
        phone: function () {
            var v = f.phone.value.trim();
            if (!v) { return setError(f.phone, 'Phone number is required.'); }
            if (!/^\d+$/.test(v)) { return setError(f.phone, 'Phone number must contain digits only.'); }
            if (!phonePattern.test(v)) {
                return setError(f.phone, 'Enter a valid 10-digit number starting with 6, 7, 8 or 9.');
            }
            return clearError(f.phone);
        },
        department: function () {
            var v = f.department.value.trim();
            if (!v) { return setError(f.department, 'Department is required.'); }
            if (v.length < 2 || v.length > 40) { return setError(f.department, 'Department must be 2 to 40 characters.'); }
            if (!textPattern.test(v)) { return setError(f.department, 'Department can contain letters only.'); }
            return clearError(f.department);
        },
        designation: function () {
            var v = f.designation.value.trim();
            if (!v) { return setError(f.designation, 'Designation is required.'); }
            if (v.length < 2 || v.length > 40) { return setError(f.designation, 'Designation must be 2 to 40 characters.'); }
            if (!textPattern.test(v)) { return setError(f.designation, 'Designation can contain letters only.'); }
            return clearError(f.designation);
        },
        joiningDate: function () {
            var v = f.joiningDate.value;
            if (!v) { return setError(f.joiningDate, 'Joining date is required.'); }
            if (v > todayStr()) { return setError(f.joiningDate, 'Joining date cannot be in the future.'); }
            if (f.dob.value && v <= f.dob.value) {
                return setError(f.joiningDate, 'Joining date must be after date of birth.');
            }
            return clearError(f.joiningDate);
        },
        address: function () {
            var v = f.address.value.trim();
            if (!v) { return setError(f.address, 'Address is required.'); }
            if (v.length < 10) { return setError(f.address, 'Address must be at least 10 characters.'); }
            if (v.length > 200) { return setError(f.address, 'Address can be at most 200 characters.'); }
            return clearError(f.address);
        },
        photo: function () {
            var file = f.photo.files[0];
            var isNew = !f.id.value;
            if (!file) {
                if (isNew) { return setError(f.photo, 'Please upload a profile image.'); }
                return clearError(f.photo); // update: keep existing image
            }
            if (ALLOWED_TYPES.indexOf(file.type) === -1) {
                f.photo.value = '';
                if (preview) { preview.classList.add('hidden'); }
                return setError(f.photo, 'Only JPG or PNG images are allowed.');
            }
            if (file.size > MAX_IMAGE_SIZE) {
                var kb = Math.round(file.size / 1024);
                f.photo.value = '';
                if (preview) { preview.classList.add('hidden'); }
                return setError(f.photo, 'Image must be 100 KB or less (selected: ' + kb + ' KB).');
            }
            if (preview) {
                preview.src = URL.createObjectURL(file);
                preview.classList.remove('hidden');
            }
            return clearError(f.photo);
        }
    };

    /* ---------- input restrictions ---------- */
    // Employee ID and phone: digits only while typing
    f.employeeId.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 9);
    });
    f.phone.addEventListener('input', function () {
        this.value = this.value.replace(/\D/g, '').slice(0, 10);
    });

    // Date limits
    f.dob.max = todayStr();
    f.joiningDate.max = todayStr();

    /* ---------- live validation ---------- */
    Object.keys(validators).forEach(function (key) {
        var input = f[key];
        var run = validators[key];
        var evt = (input.tagName === 'SELECT' || input.type === 'date' || input.type === 'file') ? 'change' : 'blur';
        input.addEventListener(evt, run);
        // re-validate on typing only after the field was flagged
        input.addEventListener('input', function () {
            if (input.classList.contains('invalid')) { run(); }
        });
    });
    f.dob.addEventListener('change', function () {
        if (f.joiningDate.value) { validators.joiningDate(); }
    });

    /* ---------- submit ---------- */
    form.addEventListener('submit', function (e) {
        var firstInvalid = null;
        Object.keys(validators).forEach(function (key) {
            var ok = validators[key]();
            if (!ok && !firstInvalid) { firstInvalid = f[key]; }
        });
        if (firstInvalid) {
            e.preventDefault();
            firstInvalid.focus();
            if (firstInvalid.scrollIntoView) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
})();
