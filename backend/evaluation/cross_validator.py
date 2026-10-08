from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
import numpy as np
from typing import Dict, Any, List
from config import RANDOM_SEED

def perform_cross_validation(model_factory, X: np.ndarray, y: np.ndarray, n_splits: int = 5) -> Dict[str, Any]:
    """
    Performs Stratified K-Fold Cross Validation (FR-13).
    Returns individual fold scores, mean, std, and stability assessments.
    """
    skf = StratifiedKFold(n_splits=n_splits, shuffle=True, random_state=RANDOM_SEED)
    
    fold_accuracies = []
    fold_f1_macros = []
    fold_precisions = []
    fold_recalls = []
    
    folds_detail = []
    
    for fold_idx, (train_index, val_index) in enumerate(skf.split(X, y)):
        X_train_fold, X_val_fold = X[train_index], X[val_index]
        y_train_fold, y_val_fold = y[train_index], y[val_index]
        
        # Instantiate fresh model instance
        fold_model = model_factory()
        fold_model.fit(X_train_fold, y_train_fold)
        
        y_pred = fold_model.predict(X_val_fold)
        
        acc = accuracy_score(y_val_fold, y_pred)
        f1 = f1_score(y_val_fold, y_pred, average="macro", zero_division=0)
        prec = precision_score(y_val_fold, y_pred, average="macro", zero_division=0)
        rec = recall_score(y_val_fold, y_pred, average="macro", zero_division=0)
        
        fold_accuracies.append(acc)
        fold_f1_macros.append(f1)
        fold_precisions.append(prec)
        fold_recalls.append(rec)
        
        folds_detail.append({
            "fold": fold_idx + 1,
            "train_samples": len(train_index),
            "val_samples": len(val_index),
            "accuracy": round(float(acc), 4),
            "f1_macro": round(float(f1), 4),
            "precision_macro": round(float(prec), 4),
            "recall_macro": round(float(rec), 4)
        })
        
    mean_acc = np.mean(fold_accuracies)
    std_acc = np.std(fold_accuracies)
    
    mean_f1 = np.mean(fold_f1_macros)
    std_f1 = np.std(fold_f1_macros)
    
    mean_prec = np.mean(fold_precisions)
    std_prec = np.std(fold_precisions)
    
    mean_rec = np.mean(fold_recalls)
    std_rec = np.std(fold_recalls)
    
    # Assess model stability based on standard deviation
    stability = "High Stability" if std_f1 < 0.03 else ("Moderate Stability" if std_f1 < 0.06 else "High Variance / Unstable")
    
    return {
        "n_splits": n_splits,
        "folds": folds_detail,
        "mean_accuracy": round(float(mean_acc), 4),
        "std_accuracy": round(float(std_acc), 4),
        "mean_f1_macro": round(float(mean_f1), 4),
        "std_f1_macro": round(float(std_f1), 4),
        "mean_precision": round(float(mean_prec), 4),
        "std_precision": round(float(std_prec), 4),
        "mean_recall": round(float(mean_rec), 4),
        "std_recall": round(float(std_rec), 4),
        "stability_status": stability
    }
