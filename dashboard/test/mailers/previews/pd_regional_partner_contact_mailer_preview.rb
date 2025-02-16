# This can be viewed on non-production environments at /rails/mailers/pd/regional_partner_contact_mailer
class Pd::RegionalPartnerContactMailerPreview < ActionMailer::Preview
  include FactoryGirl::Syntax::Methods

  def contact_receipt_with_partner
    rp = build :regional_partner
    form = build_form_data(:pd_regional_partner_contact, regional_partner: rp)
    Pd::RegionalPartnerContactMailer.receipt(form, rp)
  end

  def contact_receipt_no_partner
    form = build_form_data(:pd_regional_partner_contact)
    Pd::RegionalPartnerContactMailer.receipt(form, nil)
  end

  def contact_unmatched
    form = build_form_data(:pd_regional_partner_contact)
    Pd::RegionalPartnerContactMailer.unmatched(form, 'test+employee@code.org')
  end

  def mini_contact_matched_partner
    rp_pm = create :regional_partner_program_manager
    form = build_form_data(:pd_regional_partner_mini_contact, regional_partner: rp_pm.regional_partner)
    Pd::RegionalPartnerContactMailer.matched(form, rp_pm)
  end

  def mini_contact_unmatched
    form = build_form_data(:pd_regional_partner_mini_contact)
    Pd::RegionalPartnerContactMailer.unmatched(form, 'test+employee@code.org')
  end

  private

  def build_form_data(contact_factory, **factory_options)
    contact = build contact_factory, factory_options
    contact.sanitize_and_trim_form_data_hash
  end
end
