import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import DonorTeacherBanner from '@cdo/apps/templates/DonorTeacherBanner';
import {getStore, registerReducers} from '@cdo/apps/redux';
import isRtl from '@cdo/apps/code-studio/isRtlRedux';
import responsive from '@cdo/apps/code-studio/responsiveRedux';
import initResponsive from '@cdo/apps/code-studio/responsive';

registerReducers({isRtl, responsive});

$(document).ready(init);

function showDonorTeacherBanner() {
  const donorTeacherBannerElements = $('.donor-teacher-banner-container');
  let options = {};

  $.ajax({
    type: 'GET',
    url: '/dashboardapi/v1/users/me/donor_teacher_banner_details'
  })
    .done(results => {
      if (results) {
        options = {
          teacherFirstName: results.teacher_first_name,
          teacherSecondName: results.teacher_second_name,
          teacherEmail: results.teacher_email,
          ncesSchoolId: results.nces_school_id,
          schoolAddress1: results.school_address_1,
          schoolAddress2: results.school_address_2,
          schoolAddress3: results.school_address_2,
          schoolCity: results.school_city,
          schoolState: results.school_state,
          schoolZip: results.school_zip
        };
      }
    })
    .complete(() => {
      donorTeacherBannerElements.each((index, donorTeacherBannerElement) => {
        ReactDOM.render(
          <Provider store={getStore()}>
            <DonorTeacherBanner
              options={options}
              showPegasusLink={false}
              source="marketing"
            />
          </Provider>,
          donorTeacherBannerElement
        );
      });
    });
}

async function init() {
  initResponsive();
  if (await hasSchoolDonor('Amazon')) {
    showDonorTeacherBanner();
    $('.show-if-eligible').show();
  } else {
    $('.show-if-not-eligible').show();
  }
}

async function hasSchoolDonor(assertedDonorName) {
  const response = await fetch('/dashboardapi/v1/users/me/school_donor_name');
  const realDonorName = await response.json();
  return realDonorName === assertedDonorName;
}
