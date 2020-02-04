require 'json'

class DatasetsController < ApplicationController
  before_action :require_levelbuilder_mode
  before_action :initialize_firebase

  def index
  end

  def show_manifest
    @dataset_library_manifest = @fb.get_library_manifest
  end

  def update_manifest
    parsed = JSON.parse(params['content'])
    response = @fb.set_library_manifest parsed
    if response.success?
      redirect_to(
        datasets_manifest_path,
        notice: 'Manifest saved!'
      )
    else
      redirect_to(
        datasets_manifest_path,
        alert: 'Firebase update failed, try again.'
      )
    end
  rescue JSON::ParserError
    redirect_to(
      datasets_manifest_path,
      alert: 'Invalid JSON'
    )
  end

  private

  def initialize_firebase
    @fb = FirebaseHelper.new('shared')
  end
end
