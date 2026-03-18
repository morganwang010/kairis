package repository

import (
	"kairis/backend/internal/model"

	"gorm.io/gorm"
)

type TaxFreeBaseRepository struct {
	db *gorm.DB
}

func NewTaxFreeBaseRepository(db *gorm.DB) *TaxFreeBaseRepository {
	return &TaxFreeBaseRepository{db: db}
}

func (r *TaxFreeBaseRepository) Create(taxFreeBase *model.TaxFreeBases) error {
	return r.db.Create(taxFreeBase).Error
}

func (r *TaxFreeBaseRepository) Get(id uint) (*model.TaxFreeBases, error) {
	var taxFreeBase model.TaxFreeBases
	if err := r.db.First(&taxFreeBase, id).Error; err != nil {
		return nil, err
	}
	return &taxFreeBase, nil
}

func (r *TaxFreeBaseRepository) List() ([]model.TaxFreeBases, error) {
	var taxFreeBases []model.TaxFreeBases
	if err := r.db.Find(&taxFreeBases).Error; err != nil {
		return nil, err
	}
	return taxFreeBases, nil
}

func (r *TaxFreeBaseRepository) Update(taxFreeBase *model.TaxFreeBases) error {
	return r.db.Save(taxFreeBase).Error
}

func (r *TaxFreeBaseRepository) Delete(id uint) error {
	return r.db.Delete(&model.TaxFreeBases{}, id).Error
}
