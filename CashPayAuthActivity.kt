package org.xbet.client1.presentation.activity

import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.MenuItem
import android.view.View
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.appcompat.app.AppCompatDelegate
import androidx.appcompat.app.ViewPumpAppCompatDelegate
import androidx.appcompat.widget.Toolbar
import io.reactivex.ObservableTransformer
import org.xbet.client1.BuildConfig
import org.xbet.client1.R
import org.xbet.client1.apidata.presenters.CashPayAuthPresenter
import org.xbet.client1.databinding.LayoutPayAuthLayoutBinding
import org.xbet.client1.db.repository.RoomRepositoryImpl
import org.xbet.client1.presentation.dialog.Topping2FABottomDialog
import org.xbet.client1.presentation.view.dialogs.CustomToast
import org.xbet.client1.presentation.view_interface.PayAuthView
import org.xbet.client1.util.AnalyticsConst
import org.xbet.client1.util.AnalyticsUtils
import org.xbet.client1.util.WaitDialogUtil
import org.xbet.client1.util.setToolbarAppVers
import org.xbet.client1.util.setToolbarEposId
import org.xbet.client1.util.utilities.ThemeUtilities

class CashPayAuthActivity : AppCompatActivity(), PayAuthView, Topping2FABottomDialog.SuggestSelectDialogCallback {
    private val presenter = CashPayAuthPresenter()
    private val MIN_CLICK_INTERVAL: Long = 7
    private var lastClickTime: Long = 0
    private var _binding: LayoutPayAuthLayoutBinding? = null
    private val binding get() = _binding!!
    private var appCompatDelegate: AppCompatDelegate? = null
    private lateinit var toolbar: Toolbar

    override fun getDelegate(): AppCompatDelegate {
        return appCompatDelegate ?: ViewPumpAppCompatDelegate(
            super.getDelegate(),
            this
        ).also { appCompatDelegate = it }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        _binding = LayoutPayAuthLayoutBinding.inflate(layoutInflater)
        setContentView(binding.root)
        
        setupUI()
        setupListeners()
        if(BuildConfig.IS_TEAM_CASH) setupForTeamCash()
    }

    private fun setupUI() {
        if (ThemeUtilities.showInNightMode()) {
            window.decorView.systemUiVisibility = 0
        } else {
            window.decorView.systemUiVisibility = View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR
        }

        if (BuildConfig.IS_TEAM_CASH) {
            binding.imageView.setImageDrawable(resources.getDrawable(R.drawable.new_logo_foreground))
        }

        toolbar = binding.root.findViewById(R.id.toolbar)
        toolbar.apply {
            navigationIcon = getDrawable(R.drawable.ic_arrow_back)
            setTitle(R.string.auth)
            setSupportActionBar(this)
        }

        setTranslatedTitle()
    }

    private fun setupListeners() {
        binding.enterBtn.setOnClickListener {
            checkFieldsOrAuth()
            AnalyticsUtils.reportEvent(this, AnalyticsConst.PAY_IN_AUTH)
        }
    }

    private fun setTranslatedTitle() {
        val repository = RoomRepositoryImpl()
        repository.getTranslateItemsByKeys(listOf("auth")) { result ->
            result?.firstOrNull { it.keyView == "auth" }?.let { item ->
                Log.e("auth", item.name)
                toolbar.title = item.name
            }
        }
    }

    override fun onOptionsItemSelected(item: MenuItem): Boolean {
        if (item.itemId == android.R.id.home) {
            finish()
            return true
        }
        return super.onOptionsItemSelected(item)
    }

    private val enterButtonClick = Runnable {
        val currentTime = System.currentTimeMillis() / 1000
        if (currentTime - lastClickTime > MIN_CLICK_INTERVAL) {
            lastClickTime = currentTime
            presenter.apply {
                view = this@CashPayAuthActivity
                makeAuth(binding.loginET.text.toString(), binding.passwordET.text.toString(), currentTime.toString())
            }
            WaitDialogUtil.showDialog(supportFragmentManager)
        }
    }

    private fun checkFieldsOrAuth() {
        var isValid = true

        with(binding) {
            if (loginET.text.isEmpty()) {
                loginET.background = resources.getDrawable(R.drawable.red_login_edit_text)
                emptyUser.postDelayed({ emptyUser.visibility = View.VISIBLE }, 100)
                isValid = false
            }

            if (passwordET.text.isEmpty()) {
                passwordET.background = resources.getDrawable(R.drawable.red_login_edit_text)
                emptyPass.postDelayed({ emptyPass.visibility = View.VISIBLE }, 100)
                isValid = false
            }

            if (isValid || (BuildConfig.IS_MAIN_MOB_CASH || BuildConfig.IS_BOX7003)) {
                emptyUser.postDelayed({
                    emptyUser.visibility = View.GONE
                    emptyPass.visibility = View.GONE
                    loginET.background = resources.getDrawable(R.drawable.login_edit_text)
                    passwordET.background = resources.getDrawable(R.drawable.login_edit_text)
                }, 100)
                
                if (loginET.text.isNotEmpty() && passwordET.text.isNotEmpty()) {
                    enterButtonClick.run()
                }
            }
        }
    }

    override fun onCodeEntered(code: String) {
        WaitDialogUtil.showDialog(supportFragmentManager)
        presenter.make2FA(code)
    }

    override fun onAuthSuccess() {
        WaitDialogUtil.dissmissDialog()
        finish()
        startActivity(Intent(this, CashPayWebActivity::class.java))
    }

    override fun onNeed2FARequest(message: String?, type: Int) {
        WaitDialogUtil.dissmissDialog()
        Topping2FABottomDialog.newInstance(this, message, type).apply {
            isCancelable = true
            show(supportFragmentManager, Topping2FABottomDialog.TAG)
        }
    }

    override fun onErrorMessage(message: String?) {
        WaitDialogUtil.dissmissDialog()
        message?.let {
            CustomToast.showNegative(this, it, Toast.LENGTH_LONG)
        }
    }

    override fun <T> bindToLifecycle(): ObservableTransformer<T, T>? = null

    private fun setupForTeamCash() {
        findViewById<TextView>(R.id.epos_id_team_cash)?.setToolbarEposId()
        findViewById<TextView>(R.id.app_version_team_cash)?.setToolbarAppVers()
    }

    override fun onDestroy() {
        super.onDestroy()
        _binding = null
        presenter.view = null
    }
} 